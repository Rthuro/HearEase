from unittest import case
from urllib import request
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from case_persons.serializers import CasePersonSerializer
from case_persons.models import CasePerson
from .models import Case, SettlementType, CaseType, Relationship
from .serializers import CaseSerializer, CaseTypeSerializer, SettlementTypeSerializer, RelationshipSerializer
from hearings.models import Hearing
from django.contrib.auth import get_user_model
from django.db.models.functions import TruncMonth
from django.db.models import Count
from datetime import datetime
from django.db.models.functions import Trim 

User = get_user_model()


class CaseTypeListView(APIView):
    def get(self, request):
        case_types = CaseType.objects.all().order_by("severity")
        serializer = CaseTypeSerializer(case_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SettlementTypeListView(APIView):
    def get(self, request):
        settlements = SettlementType.objects.all().order_by("id")
        serializer = SettlementTypeSerializer(settlements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class RelationshipListView(APIView):
    def get(self, request):
        relationships = Relationship.objects.all().order_by("id")
        serializer = RelationshipSerializer(relationships, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class CaseView(APIView):
    def post(self, request):
        data = request.data.copy()
        
        complainants = data.get("complainants", [])
        complainants_ids = []

        for complainant in complainants:
            if "birth_date" in complainant and complainant["birth_date"]:
                raw_bd = str(complainant["birth_date"])
                if "T" in raw_bd:
                    complainant["birth_date"] = raw_bd.split("T")[0]

            check_complainant = CasePerson.objects.filter(
                first_name__iexact=complainant.get("first_name"),
                last_name__iexact=complainant.get("last_name"),
            ).first()

            if check_complainant:
                complainants_ids.append(check_complainant.id)
            else:
                complainant_obj = CasePerson.objects.create(**complainant)
                complainants_ids.append(complainant_obj.id)
        

        respondents = data.get("respondents", [])
        respondents_ids = []

        for respondent in respondents:
            if "birth_date" in respondent and respondent["birth_date"]:
                raw_bd = str(respondent["birth_date"])
                if "T" in raw_bd:
                    respondent["birth_date"] = raw_bd.split("T")[0]

            check_respondent = CasePerson.objects.filter(
                first_name__iexact=respondent.get("first_name"),
                last_name__iexact=respondent.get("last_name"),
            ).first()

            if check_respondent:
                respondents_ids.append(check_respondent.id)
            else:
                respondent_obj = CasePerson.objects.create(**respondent)
                respondents_ids.append(respondent_obj.id)        

        case_data = {
            "id": data.get("id"),
            "case_type_id": data.get("case_type"),
            "settlement_type_id": data.get("settlement_type"),
            "description": data.get("description"),
            "remarks": data.get("remarks"),
            "predicted_hearings": data.get("predicted_hearings"),
            "case_status": data.get("case_status"),
        }

        new_case = Case.objects.create(**case_data)

        new_case.complainants.add(*complainants_ids)
        new_case.respondents.add(*respondents_ids)

        # If hearing info is provided, create initial hearing
        hearing_info = data.get("hearing_info")
        if hearing_info:
            for h_data in hearing_info:

                raw_date = h_data.get("hearing_date")
                clean_date = None
                if raw_date:
                    if "T" in raw_date:
                        clean_date = raw_date.split("T")[0]
                    else:
                        clean_date = raw_date

                h_number = h_data.get("hearing_number")
                
                if h_number == 1:
                    current_status = "scheduled"
                    current_remarks = h_data.get("remarks") or "Initial hearing scheduled."
                else:
                    current_status = "pending_schedule"
                    current_remarks = h_data.get("remarks") or "Subsequent hearing pending."

                lupon_id = h_data.get("lupon_member_id")
                
                Hearing.objects.create(
                    case=new_case,  
                    hearing_number=h_number,
                    hearing_date=clean_date, 
                    time=h_data.get("time"),
                    lupon_member_id=lupon_id,
                    remarks=current_remarks,
                    hearing_status=current_status,
                )

        # Serialize and return
        serializer = CaseSerializer(new_case)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        role = request.query_params.get("role")
        email = request.query_params.get("email")

        user_id = User.objects.filter(email=email).first()
        user_as_complainant = CasePerson.objects.filter(email=email).first()

        if role == "user":
            cases = Case.objects.filter(complainants=user_as_complainant.id)
        else:
            cases = Case.objects.all().select_related("case_type", "settlement_type", "respondent_user", "complainant_user")

        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk=None):
        try:
            case = Case.objects.get(pk=pk)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if status is changing to resolved
        old_status = case.case_status
        new_status = request.data.get("case_status", old_status)
        
        serializer = CaseSerializer(case, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            
            # Trigger auto-retrain check if case was just resolved
            if old_status != "resolved" and new_status == "resolved":
                try:
                    from AIModel.retrain_model import increment_resolved_count
                    increment_resolved_count()
                    print(f"[Case] Case #{pk} resolved - auto-retrain counter incremented")
                except Exception as e:
                    print(f"[Case] Auto-retrain check failed: {e}")
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CaseListView(APIView):
    def get(self, request):
        is_admin_param = request.query_params.get("is_admin", "false")
        is_admin = str(is_admin_param).lower() == "true"

        email = request.query_params.get("email")
        cases = []

        if not email:
            return Response([], status=status.HTTP_200_OK)

        case_person = CasePerson.objects.filter(email=email).first()
        
        if is_admin:
            cases = Case.objects.all().select_related("case_type", "settlement_type").order_by("-date_filed")
        
        elif not is_admin and case_person:
            cases = Case.objects.filter(complainants=case_person).order_by("-date_filed")

        else:
            cases = []

        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
          
    def post(self, request):
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        middle_name = request.data.get("middle_name", "")

        # print(f"Searching for: {first_name} (Middle: {middle_name}) {last_name}")

        # print(f"CasePersons:", CasePerson.objects.all())
        base_matches = CasePerson.objects.annotate(
            clean_first=Trim('first_name'),
            clean_last=Trim('last_name'),
            clean_middle=Trim('middle_name')
        ).filter(
            clean_first__iexact=first_name,
            clean_last__iexact=last_name,
            email__isnull=True
        )

        # print("Base Matches IDs:", base_matches)

        final_persons = []

        if middle_name:
            matches = base_matches.filter(clean_middle=middle_name)
            for match in matches:
                final_persons.append(match.id)
        else:
            matches = base_matches.filter(clean_middle__isnull=True)
            for match in matches:
                final_persons.append(match.id)

        # print("Matching IDs:", list(final_persons))

        if not final_persons:
            return Response([], status=status.HTTP_200_OK)

        cases_as_complainant = Case.objects.filter(complainants__in=final_persons)
        cases_as_respondent = Case.objects.filter(respondents__in=final_persons)

        all_cases = (cases_as_complainant | cases_as_respondent).distinct().order_by("-date_filed")

        serializer = CaseSerializer(all_cases, many=True)
        final_persons = CasePersonSerializer(base_matches.filter(id__in=final_persons), many=True).data
        return Response({
            "cases": serializer.data,
            "match_persons": final_persons
        }, status=status.HTTP_200_OK)

class SyncCasesView(APIView):
    def post(self, request):
        case_persons_data = request.data.get("case_persons", [])
        
        if not case_persons_data:
            return Response({"error": "No case persons provided"}, status=status.HTTP_400_BAD_REQUEST)

        reference_person_id = None
        other_person_ids = []

        for person_data in case_persons_data:
            p_id = person_data.get("id")
            if not p_id: continue
            
            is_complete = all([
                person_data.get("first_name"),
                person_data.get("middle_name"),
                person_data.get("last_name")
            ])

            if is_complete and reference_person_id is None:
                reference_person_id = p_id
            else:
                other_person_ids.append(p_id)

        if reference_person_id is None and other_person_ids:
            reference_person_id = other_person_ids.pop(0)

        if reference_person_id is None:
            return Response({"error": "No complete name found in case_persons"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            
            with transaction.atomic():
                cases_complainants = Case.objects.filter(complainants__id__in=other_person_ids).distinct()

                for case in cases_complainants:
                    case.complainants.add(reference_person_id)
                    case.complainants.remove(*other_person_ids)

                cases_respondents = Case.objects.filter(respondents__id__in=other_person_ids).distinct()
                    
                for case in cases_respondents:
                    case.respondents.add(reference_person_id)
                    case.respondents.remove(*other_person_ids)

                CasePerson.objects.filter(id=reference_person_id).update(
                email=request.data.get("email") )

                if other_person_ids:
                    CasePerson.objects.filter(id__in=other_person_ids).delete()
            return Response({
                "message": "Sync successful",
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CaseDeleteView(APIView):
    def delete(self, request):
        case_id = request.data.get("case_id")

        try:
            case = Case.objects.get(id=case_id)
            case.delete()
            return Response({"message": "Case deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=status.HTTP_404_NOT_FOUND)

class UpdateCaseInfoView(APIView):
    def put(self, request, pk):
        try:
            case = Case.objects.get(pk=pk)
        except Case.DoesNotExist:
            return Response({"error": "Case not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if status is changing to resolved
        old_status = case.case_status
        new_status = request.data.get("case_status", old_status)

        serializer = CaseSerializer(case, data=request.data, partial=True)

        if serializer.is_valid():
            case = serializer.save()
            
            # Trigger auto-retrain check if case was just resolved
            if old_status != "resolved" and new_status == "resolved":
                try:
                    from AIModel.retrain_model import increment_resolved_count
                    increment_resolved_count()
                    print(f"[Case] Case #{pk} resolved - auto-retrain counter incremented")
                except Exception as e:
                    print(f"[Case] Auto-retrain check failed: {e}")
            
            response_data = CaseSerializer(case).data
            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SingleCaseView(APIView):
    def get(self, request):
        case_id = request.query_params.get("case_id")
        try:
            case = Case.objects.get(id=case_id)
            serializer = CaseSerializer(case)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Case.DoesNotExist:
            return Response({"error": "Case not found."}, status=status.HTTP_404_NOT_FOUND)

class ReportView(APIView):
    def get(self, request):
        start = request.GET.get('start_date')
        end = request.GET.get('end_date')

        # Default: last 6 months
        if not start or not end:
            start = datetime.now().replace(month=datetime.now().month-5, day=1)
            end = datetime.now()

        pending = (
            Case.objects.filter(case_status="pending_approval", date_filed__range=[start, end])
            .annotate(month=TruncMonth('date_filed'))
            .values('month')
            .annotate(total=Count('id'))
        )

        approved = (
            Case.objects.filter(case_status="approved", date_filed__range=[start, end])
            .annotate(month=TruncMonth('date_filed'))
            .values('month')
            .annotate(total=Count('id'))
        )

        resolved = (
            Case.objects.filter(case_status="resolved", date_filed__range=[start, end])
            .annotate(month=TruncMonth('date_filed'))
            .values('month')
            .annotate(total=Count('id'))
        )

        # Combine results
        result = []
        months = sorted(set([f['month'] for f in pending] + [a['month'] for a in approved] + [r['month'] for r in resolved]))

        for m in months:
            f = next((x['total'] for x in pending if x['month'] == m), 0)
            a = next((x['total'] for x in approved if x['month'] == m), 0)
            r = next((x['total'] for x in resolved if x['month'] == m), 0)
            result.append({
                "month": m.strftime("%b"),
                "pending": f,
                "approved": a,
                "resolved": r,
            })

        return Response(result)


class CasePriorityView(APIView):
    """
    Calculate and return cases sorted by priority score.
    
    GET /api/case-priority/
    
    Query params:
    - status: Filter by case status (optional)
    - limit: Number of cases to return (default: 20)
    
    Response:
    [
        {
            "case_id": "...",
            "priority_score": 85,
            "priority_level": "high",
            "case_type": "Grave Threats",
            "severity": 3,
            "age_days": 14,
            "hearing_count": 2,
            "reasons": ["High severity", "Case aging"]
        }
    ]
    """
    
    def get(self, request):
        status_filter = request.query_params.get("status")
        limit = int(request.query_params.get("limit", 20))
        
        # Build query
        cases_query = Case.objects.exclude(
            case_status__in=["resolved", "rejected", "cancelled"]
        ).select_related("case_type", "relationship")
        
        if status_filter:
            cases_query = cases_query.filter(case_status=status_filter)
        
        # Calculate priority for each case
        prioritized_cases = []
        now = datetime.now()
        
        for case in cases_query:
            score = 0
            reasons = []
            
            # Severity weight (30 points per level)
            severity = case.case_type.severity if case.case_type else 1
            severity_points = severity * 30
            score += severity_points
            if severity >= 3:
                reasons.append("High severity")
            
            # Relationship urgency (Family cases get priority)
            relationship_name = case.relationship.relationship if case.relationship else ""
            if relationship_name.lower() == "family":
                score += 15
                reasons.append("Family dispute - urgent")
            elif relationship_name.lower() in ["neighbor", "ex-partner"]:
                score += 10
                reasons.append("High-conflict relationship")
            else:
                score += 5
            
            # Case aging (older cases get more priority, max 30 points)
            if case.date_filed:
                age_days = (now - case.date_filed.replace(tzinfo=None)).days
                age_points = min(age_days, 30)
                score += age_points
                if age_days >= 14:
                    reasons.append(f"Case aging ({age_days} days)")
            else:
                age_days = 0
            
            # Hearing count - cases with many hearings might be stuck
            hearing_count = Hearing.objects.filter(case=case).count()
            predicted = case.predicted_hearings or 3
            if hearing_count > predicted:
                overrun_points = (hearing_count - predicted) * 10
                score += min(overrun_points, 20)
                reasons.append(f"Exceeding predicted hearings ({hearing_count}/{predicted})")
            
            # Determine priority level
            if score >= 70:
                priority_level = "high"
            elif score >= 45:
                priority_level = "medium"
            else:
                priority_level = "low"
            
            prioritized_cases.append({
                "case_id": case.id,
                "priority_score": score,
                "priority_level": priority_level,
                "case_type": case.case_type.case_name if case.case_type else "Unknown",
                "severity": severity,
                "relationship": relationship_name,
                "age_days": age_days,
                "hearing_count": hearing_count,
                "predicted_hearings": predicted,
                "case_status": case.case_status,
                "reasons": reasons if reasons else ["Standard priority"]
            })
        
        # Sort by priority score (highest first)
        prioritized_cases.sort(key=lambda x: x["priority_score"], reverse=True)
        
        return Response(prioritized_cases[:limit], status=status.HTTP_200_OK)


