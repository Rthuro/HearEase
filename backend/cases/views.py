from unittest import case
from urllib import request
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Case, SettlementType, CaseType
from respondents.models import Respondent
from complainants.models import Complainant
from complainants.serializers import ComplainantSerializer
from .serializers import CaseSerializer, CaseTypeSerializer, SettlementTypeSerializer
from hearings.models import Hearing
from django.contrib.auth import get_user_model

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

class CaseView(APIView):
    def post(self, request):
        data = request.data.copy()
        complainant_data = data.get("complainant_user")
        check_user = Complainant.objects.filter(first_name=complainant_data.get("first_name"), last_name=complainant_data.get("last_name")).first()

        if check_user:
            complainant_id = check_user.id
        else:
            complainant = Complainant.objects.create(**complainant_data)
            complainant_id = complainant.id
        
        co_complainants = data.get("co_complainants")
        co_complainants_ids = []

        for complainant in co_complainants:
            check_complainant = Complainant.objects.filter(
                first_name__iexact=complainant.get("first_name"),
                last_name__iexact=complainant.get("last_name"),
            ).first()

            if check_complainant:
                co_complainants_ids.append(check_complainant.id)
            else:
                # Create a new complainant if not found
                co_complainant = Complainant.objects.create(**complainant)
                co_complainants_ids.append(co_complainant.id)
        

        # Extract respondent data
        respondent_data = data.get("respondent")

        # Try to find an existing respondent by name or contact number
        respondent = Respondent.objects.filter(
            first_name__iexact=respondent_data.get("first_name"),
            last_name__iexact=respondent_data.get("last_name"),
        ).first()

        if respondent:
            # Update respondent info if provided
            for field, value in respondent_data.items():
                if value not in [None, ""]:
                    setattr(respondent, field, value)
            respondent.save()
        else:
            # Create a new respondent if not found
            respondent = Respondent.objects.create(**respondent_data)

        case_data = {
            "id": data.get("id"),
            "case_type_id": data.get("case_type"),
            "settlement_type_id": data.get("settlement_type"),
            "complainant_user_id": complainant_id,
            "respondent_user_id": respondent.id,
            "description": data.get("description"),
            "co_complainants_ids": co_complainants_ids,
            "remarks": data.get("remarks"),
            "predicted_hearings": data.get("predicted_hearings"),
            "case_status": "pending_approval",
        }

        new_case = Case.objects.create(**case_data)

        # If hearing info is provided, create initial hearing
        hearing_info = data.get("hearing_info")
        if hearing_info:
            Hearing.objects.create(
                case=new_case,  
                hearing_date=hearing_info.get("hearing_date"),
                time=hearing_info.get("time"),
                lupon_member_id=hearing_info.get("lupon_member"),  
                remarks=hearing_info.get("remarks", "Initial hearing pending schedule."),
                hearing_status=hearing_info.get("hearing_status", "pending_schedule"),
            )

        # Serialize and return
        serializer = CaseSerializer(new_case)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get(self, request):
        role = request.query_params.get("role")
        email = request.query_params.get("email")

        user_id = User.objects.filter(username=email).first()

        if role == "user":
            cases = Case.objects.filter(complainant_user_id=user_id)
        else:
            cases = Case.objects.all().select_related("case_type", "settlement_type", "respondent_user", "complainant_user")

        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, pk=None):
        try:
            case = Case.objects.get(pk=pk)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CaseSerializer(case, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CaseListView(APIView):
    def post(self, request):
        role = request.data.get("role")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")

        user_id = Complainant.objects.filter(first_name=first_name, last_name=last_name).first()

        if role == "user":
            cases = Case.objects.filter(complainant_user_id=user_id)
        else:
            cases = Case.objects.all().select_related("case_type", "settlement_type", "respondent_user", "complainant_user")

        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
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

        serializer = CaseSerializer(case, data=request.data, partial=True)

        if serializer.is_valid():
            case = serializer.save()
            response_data = CaseSerializer(case).data
            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



