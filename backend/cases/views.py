from unittest import case
from urllib import request
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from case_persons.serializers import CasePersonSerializer
from case_persons.models import CasePerson
from .models import Case, SettlementType, CaseType, Relationship, CFA
from users.models import NotificationPreference
from users.utils import EmailNotification, PhoneNotification
from .serializers import CaseSerializer, CaseTypeSerializer, SettlementTypeSerializer, RelationshipSerializer, CFASerializer
from hearings.models import Hearing, HearingAttendance
from django.contrib.auth import get_user_model
from django.db.models.functions import TruncMonth
from django.db.models import Count
from datetime import datetime, timedelta
from django.db.models.functions import Trim 
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils.dateparse import parse_date
from django.db.models import Count, Avg, F, Q
from django.utils import timezone

User = get_user_model()


class CaseTypeListView(APIView):
    def post(self, request):
        name = request.data.get("case_name")
        severity = request.data.get("severity")
        description = request.data.get("description")

        if not name:
            return Response({"error": "Case type name is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            case_type = CaseType.objects.create(
                case_name=name,
                severity=severity,
                description=description
            )
            serializer = CaseTypeSerializer(case_type)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def get(self, request):
        case_types = CaseType.objects.all().order_by("severity")
        serializer = CaseTypeSerializer(case_types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CaseTypeDetailView(APIView):
    def put(self, request, pk):
        try:
            case_type = CaseType.objects.get(pk=pk)
        except CaseType.DoesNotExist:
            return Response({"error": "Case type not found."}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get("case_name")
        severity = request.data.get("severity")
        description = request.data.get("description")

        if name:
            case_type.case_name = name
        if severity is not None:
            case_type.severity = severity
        if description is not None:
            case_type.description = description

        case_type.save()
        serializer = CaseTypeSerializer(case_type)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def delete(self, request, pk):
        try:
            case_type = CaseType.objects.get(pk=pk)
            case_type.delete()
            return Response({"message": "Case type deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except CaseType.DoesNotExist:
            return Response({"error": "Case type not found."}, status=status.HTTP_404_NOT_FOUND)
        
class SettlementTypeListView(APIView):
    def post(self, request):
        name = request.data.get("settlement_name")
        description = request.data.get("description")

        if not name:
            return Response({"error": "Settlement name is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            settlement = SettlementType.objects.create(
                settlement_name=name,
                description=description
            )
            serializer = SettlementTypeSerializer(settlement)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def get(self, request):
        settlements = SettlementType.objects.all().order_by("id")
        serializer = SettlementTypeSerializer(settlements, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class SettlementTypeDetailView(APIView):
    def put(self, request, pk):
        try:
            settlement = SettlementType.objects.get(pk=pk)
        except SettlementType.DoesNotExist:
            return Response({"error": "Settlement type not found."}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get("settlement_name")
        description = request.data.get("description")

        if name:
            settlement.settlement_name = name
        if description is not None:
            settlement.description = description

        settlement.save()
        serializer = SettlementTypeSerializer(settlement)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def delete(self, request, pk):
        try:
            settlement = SettlementType.objects.get(pk=pk)
            settlement.delete()
            return Response({"message": "Settlement type deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except SettlementType.DoesNotExist:
            return Response({"error": "Settlement type not found."}, status=status.HTTP_404_NOT_FOUND)
    
class RelationshipListView(APIView):
    def post(self, request):
        relationship = request.data.get("relationship")

        if not relationship:
            return Response({"error": "Relationship is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            relationship_obj = Relationship.objects.create(
                relationship=relationship
            )
            serializer = RelationshipSerializer(relationship_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def get(self, request):
        relationships = Relationship.objects.all().order_by("id")
        serializer = RelationshipSerializer(relationships, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RelationshipListDetailView(APIView):
    def put(self, request, pk):
        try:
            relationship = Relationship.objects.get(pk=pk)
        except Relationship.DoesNotExist:
            return Response({"error": "Relationship not found."}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get("relationship")

        if name:
            relationship.relationship = name

        relationship.save()
        serializer = RelationshipSerializer(relationship)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def delete(self, request, pk):
        try:
            relationship = Relationship.objects.get(pk=pk)
            relationship.delete()
            return Response({"message": "Relationship deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Relationship.DoesNotExist:
            return Response({"error": "Relationship not found."}, status=status.HTTP_404_NOT_FOUND)
    def delete(self, request, pk):
        try:
            relationship = Relationship.objects.get(pk=pk)
            relationship.delete()
            return Response({"message": "Relationship deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Relationship.DoesNotExist:
            return Response({"error": "Relationship not found."}, status=status.HTTP_404_NOT_FOUND)

class CFAView(APIView):
    def post(self, request):
        cfa = request.data.get("cfa")

        if not cfa:
            return Response({"error": "CFA is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cfa_obj = CFA.objects.create(
                cfa=cfa
            )
            serializer = CFASerializer(cfa_obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def get(self, request):
        cfas = CFA.objects.all().order_by("id")
        serializer = CFASerializer(cfas, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CFADetailView(APIView):
    def put(self, request, pk):
        try:
            cfa = CFA.objects.get(pk=pk)
        except CFA.DoesNotExist:
            return Response({"error": "CFA not found."}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get("cfa")
        description = request.data.get("description")

        if name:
            cfa.cfa = name
            cfa.description = description

        cfa.save()
        serializer = CFASerializer(cfa)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def delete(self, request, pk):
        try:
            cfa = CFA.objects.get(pk=pk)
            cfa.delete()
            return Response({"message": "CFA deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except CFA.DoesNotExist:
            return Response({"error": "CFA not found."}, status=status.HTTP_404_NOT_FOUND)
    

class CaseView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        try:
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
                         
            with transaction.atomic():
                rel_instance = Relationship.objects.get(relationship=data.get("relationship"))
                case_data = {
                    "id": data.get("id"),
                    "description": data.get("description"),
                    "remarks": data.get("remarks"),
                    "predicted_hearings": data.get("predicted_hearings"),
                    "case_status": data.get("case_status"),
                    "relationship_id": rel_instance.id,
                    "create_by": data.get("create_by"),
                }

                # Handle case_type - check if it's "other" (custom case type)
                case_type_value = data.get("case_type")
                custom_case_type_name = data.get("custom_case_type_name", "").strip()
                custom_severity = data.get("custom_severity")
                
                if case_type_value == "other" and custom_case_type_name:
                    # Validate and set severity (default to 2 if not provided or invalid)
                    try:
                        severity = int(custom_severity) if custom_severity else 2
                        severity = max(1, min(3, severity))  # Clamp between 1-3
                    except (ValueError, TypeError):
                        severity = 2
                    
                    # Create a new custom case type with user-specified severity
                    custom_case_type, created = CaseType.objects.get_or_create(
                        case_name__iexact=custom_case_type_name,
                        defaults={
                            "case_name": custom_case_type_name,
                            "severity": severity,
                            "description": "User-created custom case type",
                            "is_custom": True
                        }
                    )
                    # If case type already exists, update severity if different
                    if not created and custom_case_type.severity != severity:
                        custom_case_type.severity = severity
                        custom_case_type.save()
                    
                    case_data["case_type_id"] = custom_case_type.id
                else:
                    case_data["case_type_id"] = case_type_value
                
                case_data["settlement_type_id"] = data.get("settlement_type")

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
                            # Handle both string ISO dates and Date objects serialized as strings
                            raw_date_str = str(raw_date)
                            if "T" in raw_date_str:
                                clean_date = raw_date_str.split("T")[0]
                            else:
                                clean_date = raw_date_str

                        h_number = h_data.get("hearing_number")
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

                if new_case.case_status != "filed":
                    send_notification(ids=[p.id for p in new_case.complainants.all()], case_id=new_case.id, case_status=new_case.case_status, remarks=request.data.get("remarks"), type=1)

                # Serialize and return
                serializer = CaseSerializer(new_case)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            import traceback
            print(f"[CaseView.post] Error: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        role = request.query_params.get("role")
        email = request.query_params.get("email")

        if role == "user":
            user_as_complainant = CasePerson.objects.filter(email=email).first()
            if user_as_complainant:
                cases = Case.objects.filter(complainants=user_as_complainant.id)
            else:
                cases = Case.objects.none()
        else:
            cases = Case.objects.all().select_related("case_type", "settlement_type", "relationship")

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
            complainant_cases = Case.objects.filter(complainants=case_person)
    
            respondent_cases = Case.objects.filter(respondents=case_person)

            cases = (complainant_cases | respondent_cases).distinct().order_by("-date_filed")
            # cases = Case.objects.filter(complainants=case_person, respondents=case_person).order_by("-date_filed")

        else:
            cases = []

        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
          
    def post(self, request):
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")

        print(f"Searching for: {first_name} {last_name}")

        # print(f"CasePersons:", CasePerson.objects.all())
        base_matches = CasePerson.objects.filter(
            first_name__icontains=first_name.strip(),
            last_name__iexact=last_name.strip(),
            email__isnull=True
        )

        print("Base Matches IDs:", base_matches)

        final_persons = []
        for match in base_matches:
                final_persons.append(match.id)
            

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

            send_notification(ids=[p.id for p in case.complainants.all()], case_id=case.id, case_status=new_status, remarks=request.data.get("remarks", ""), type=2)
            response_data = CaseSerializer(case).data
            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateHearingProgressView(APIView):
    def put(self, request, pk):
        outcome = request.data.get("outcome")
        hearing_id = request.data.get("hearing_id")
        hearing_number = request.data.get("hearing_number")
        attendance = request.data.get("attendance")
        print("Received attendance data:", attendance)

        try:
            case = Case.objects.get(pk=pk)
        except Case.DoesNotExist:
            return Response({"error": "Case not found."}, status=status.HTTP_404_NOT_FOUND)

        # Start a transaction so that if one part fails, nothing is saved
        with transaction.atomic():

            if outcome == "completed":
                for a in attendance:
                    role = a.get("participant_role")
                    attendee_id = a.get("id")
                    attendance_status = a.get("attendance_status")

                    if role == "lupon":
                        HearingAttendance.objects.update_or_create(
                            hearing_id=hearing_id,
                            lupon_member_id=attendee_id,
                            participant_role=role,
                            defaults={"attendance_status": attendance_status}
                        )
                    
                    elif role in ["complainant", "respondent"]:
                        HearingAttendance.objects.update_or_create(
                            hearing_id=hearing_id,
                            case_person_id=attendee_id,
                            participant_role=role,
                            defaults={"attendance_status": attendance_status}
                        )

                Hearing.objects.filter(id=hearing_id).update(
                    hearing_status="completed",                        
                    hearing_completed_date=datetime.now(),
                    remarks=request.data.get("remarks")
                )
                Hearing.objects.filter(case=case, hearing_number=hearing_number+1).update(
                    hearing_status="scheduled",
                    remarks="Hearing scheduled."
                )

            elif outcome == "new_hearing":
                for a in attendance:
                    role = a.get("participant_role")
                    attendee_id = a.get("id")
                    attendance_status = a.get("attendance_status")

                    if role == "lupon":
                        HearingAttendance.objects.update_or_create(
                            hearing_id=hearing_id,
                            lupon_member_id=attendee_id,
                            participant_role=role,
                            defaults={"attendance_status": attendance_status}
                        )
                    
                    elif role in ["complainant", "respondent"]:
                        HearingAttendance.objects.update_or_create(
                            hearing_id=hearing_id,
                            case_person_id=attendee_id,
                            participant_role=role,
                            defaults={"attendance_status": attendance_status}
                        )
                        
                Hearing.objects.filter(id=hearing_id).update(
                    hearing_status="completed",
                    hearing_completed_date=datetime.now(),
                    remarks=request.data.get("remarks")
                )
                
                Hearing.objects.create(
                    case=case,
                    hearing_number=hearing_number + 1,
                    hearing_date=request.data.get("new_hearing_date"),
                    time=request.data.get("new_hearing_time"),
                    lupon_member_id=request.data.get("lupon_member_id"),
                    remarks="Subsequent hearing pending. Summon to be served.",
                    hearing_status="scheduled",
                )

            elif outcome == "rescheduled":
                resched_date = request.data.get("rescheduled_hearing_date")
                if not resched_date:
                    return Response({"error": "Rescheduled date required."}, status=400)
                
                Hearing.objects.filter(id=hearing_id).update(
                    hearing_date=resched_date,
                    hearing_status="rescheduled",
                    remarks=request.data.get("reason")
                )

            elif outcome in ["settled", "court"]:
                for a in attendance:
                    role = a.get("participant_role")
                    attendee_id = a.get("id")
                    attendance_status = a.get("attendance_status")

                    if role == "lupon":
                        HearingAttendance.objects.update_or_create(
                            hearing_id=hearing_id,
                            lupon_member_id=attendee_id,
                            participant_role=role,
                            defaults={"attendance_status": attendance_status}
                        )
                    
                    elif role in ["complainant", "respondent"]:
                        HearingAttendance.objects.update_or_create(
                            hearing_id=hearing_id,
                            case_person_id=attendee_id,
                            participant_role=role,
                            defaults={"attendance_status": attendance_status}
                        )

                if outcome == "settled":                    
                    case.settlement_type_id = request.data.get("settlement_type_id")
                    case.case_status = "resolved"
                    case.remarks = request.data.get("remarks")
                    case.case_completed_date = datetime.now()
                    case.actual_hearings = hearing_number

                    Hearing.objects.filter(id=hearing_id).update(
                        hearing_status="completed",
                        hearing_completed_date=datetime.now(),
                        remarks="Hearing completed (Case resolved by settlement)."
                    )

                    Hearing.objects.filter(case=case, hearing_number__gt=hearing_number).delete()

                    send_notification(ids=[p.id for p in case.complainants.all()], case_id=case.id, case_status="resolved", remarks=request.data.get("remarks"), type=2)

                else: # court
                    for a in attendance:
                        role = a.get("participant_role")
                        attendee_id = a.get("id")
                        attendance_status = a.get("attendance_status")

                        if role == "lupon":
                            HearingAttendance.objects.update_or_create(
                                hearing_id=hearing_id,
                                lupon_member_id=attendee_id,
                                participant_role=role,
                                defaults={"attendance_status": attendance_status}
                            )
                        
                        elif role in ["complainant", "respondent"]:
                            HearingAttendance.objects.update_or_create(
                                hearing_id=hearing_id,
                                case_person_id=attendee_id,
                                participant_role=role,
                                defaults={"attendance_status": attendance_status}
                            )

                    case.case_status = "escalated"
                    case.cfa_id = request.data.get("cfa_destination")
                    case.remarks = request.data.get("remarks")

                    Hearing.objects.filter(id=hearing_id).update(
                        hearing_status="completed",
                        hearing_completed_date=datetime.now(),
                        remarks="Hearing completed (Case escalated to court)."
                    )

                    send_notification(ids=[p.id for p in case.complainants.all()], case_id=case.id, case_status="escalated", remarks=request.data.get("remarks"), type=2)
                
                case.save()

            serializer = CaseSerializer(case, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            
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
        start_str = request.query_params.get('start_date')
        end_str = request.query_params.get('end_date')

        # 1. Handle Timezone-Aware Dates
        # Using timezone.now() fixes the "naive datetime" warning
        if start_str and end_str:
            start_date = parse_date(start_str)
            end_date = parse_date(end_str)
        else:
            today = timezone.now().date()
            end_date = today
            start_date = today - timedelta(days=180)

        # Base queryset for the specific range
        # Use date_filed__date to compare dates safely with aware datetimes
        cases_in_range = Case.objects.filter(
            date_filed__date__range=[start_date, end_date]
        )

        # 2. Key Metrics Calculation
        total_cases = cases_in_range.count()
        
        # Calculate multiple counts in one query using filter=Q(...)
        stats = cases_in_range.aggregate(
            active=Count('id', filter=Q(case_status__in=['pending_approval', 'in_progress'])),
            settled=Count('id', filter=Q(case_status='resolved')),
            closed=Count('id', filter=Q(case_status__in=['resolved', 'escalated', 'cancelled']))
        )

        settlement_rate = 0
        if stats['closed'] > 0:
            settlement_rate = round((stats['settled'] / stats['closed']) * 100, 1)

        # 3. Resolution Time Logic
        avg_days = 0
        resolved_cases = cases_in_range.filter(case_status='resolved')
        if resolved_cases.exists():
            duration_data = resolved_cases.aggregate(
                avg_duration=Avg(F('case_completed_date') - F('date_filed'))
            )
            if duration_data['avg_duration']:
                # duration_data['avg_duration'] is a timedelta object
                avg_days = round(duration_data['avg_duration'].total_seconds() / 86400, 1)

        # 4. Optimized Monthly Summary (ONE QUERY instead of 5)
        monthly_stats = (
            cases_in_range
            .annotate(month=TruncMonth('date_filed'))
            .values('month')
            .annotate(
                pending_count=Count('id', filter=Q(case_status="pending_approval")),
                approved_count=Count('id', filter=Q(case_status="approved")),
                progress_count=Count('id', filter=Q(case_status="in_progress")),
                resolved_count=Count('id', filter=Q(case_status="resolved")),
                escalated_count=Count('id', filter=Q(case_status="escalated")),
            )
            .order_by('month')
        )

        # Format monthly results for the frontend
        monthly_sum_result = []
        for entry in monthly_stats:
            # month might be None if date_filed is null
            if entry['month']:
                monthly_sum_result.append({
                    "month": entry['month'].strftime("%b"),
                    "pending": entry['pending_count'],
                    "approved": entry['approved_count'],
                    "in_progress": entry['progress_count'],
                    "resolved": entry['resolved_count'],
                    "escalated": entry['escalated_count']
                })

        by_type_data = cases_in_range.values(
            name=F('case_type__case_name') # Rename field to 'name' for frontend
        ).annotate(
            value=Count('id')              # Rename count to 'value'
        ).order_by('-value')

        # --- DATA SET 2: Cases by Purok/Street (Bar Chart) ---
        # Group by Complainant's Street
        by_location_data = cases_in_range.exclude(
            complainants__street__isnull=True
        ).exclude(
            complainants__street__exact=''
        ).values(
            name=F('complainants__street') # Group by Street/Purok
        ).annotate(
            value=Count('id')
        ).order_by('-value')[:10]

        return Response({
            "monthly_sum_result": monthly_sum_result,
            "total_cases": total_cases,
            "active_cases": stats['active'],
            "settlement_rate": f"{settlement_rate}%",
            "avg_resolution_time": f"{avg_days} Days",
            "by_type_data": list(by_type_data),
            "by_location_data": list(by_location_data),
            "date_range": {
                "start": start_date,
                "end": end_date
            }
        })
    
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

def send_notification(ids, case_id, case_status, remarks="", type=1): 
    all_involved_complainants = ids
    involved_complainants = CasePerson.objects.filter(
        id__in=all_involved_complainants,
        email__isnull=False
    ).exclude(email__exact="")

    involved_complainant_emails = [p.email for p in involved_complainants]
    users_to_notify = User.objects.filter(
        email__in=involved_complainant_emails
    ).select_related('notification_preferences')

    for user in users_to_notify:
        try:
            prefs = user.notification_preferences
        except NotificationPreference.DoesNotExist:
            print(f"Skipping {user.email}: No notification preferences found.")
            continue

        # --- EMAIL NOTIFICATION ---
        # Check if Account is Verified AND User allows Emails
        if user.is_email_verified and prefs.allow_email:
            if type == 1:  # Case Created
                EmailNotification.created_case_notification(
                    user_email=user.email,
                    name=f"{user.first_name} {user.middle_name or ''} {user.last_name}",
                    case_number=case_id,
                    case_status=case_status
                )
            elif type == 2:  # Case Updated
                EmailNotification.case_status_update_notification(
                    user_email=user.email,
                    name=f"{user.first_name} {user.middle_name or ''} {user.last_name}",
                    case_number=case_id,
                    case_status=case_status,
                    remarks=remarks
                )

        # --- PHONE/SMS NOTIFICATION ---
        # Check if Phone is Verified AND User allows SMS
        if user.is_phone_verified and prefs.allow_sms: 
            if user.contact_number:

                if  user.contact_number.startswith("0"):
                    formatted_phone = f"+63{user.contact_number[1:]}"
                elif not user.contact_number.startswith("+"):
                    formatted_phone = f"+{user.contact_number}"
                else:
                    formatted_phone = user.contact_number

                if type == 1:  # Case Created
                    PhoneNotification.created_case_notification(
                        user_email=user.email,
                        contact_number=formatted_phone,
                        name=f"{user.first_name} {user.middle_name or ''} {user.last_name}",
                        case_number=case_id,
                        case_status=case_status
                    )
                elif type == 2:  # Case Updated
                    PhoneNotification.case_status_update_notification(
                        user_email=user.email,
                        contact_number=formatted_phone,
                        name=f"{user.first_name} {user.middle_name or ''} {user.last_name}",
                        case_number=case_id,
                        case_status=case_status,
                        remarks=remarks
                    )
