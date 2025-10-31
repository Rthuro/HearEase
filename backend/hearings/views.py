from django.shortcuts import render
from .models import Hearing
from cases.models import Case
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .serializers import HearingSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Create your views here.

class HearingView(APIView):
    def get(self, request):
        role = request.query_params.get("role")
        user = request.query_params.get("email")

        user_id = User.objects.filter(username=user).first().id

        if role == "user":
            cases = Case.objects.filter(complainant_user_id=user_id)
        else:
            cases = Case.objects.all()
        
        case_ids = [case.id for case in cases]
        hearings = Hearing.objects.filter(case_id__in=case_ids)

        # hearings = Hearing.objects.all()
        serializer = HearingSerializer(hearings, many=True)

        if not hearings.exists():
            return Response({"error": "No hearings found for this case."}, status=status.HTTP_200_OK)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class HearingCaseView(APIView):
    def get(self, request):
        case_id = request.query_params.get("case_id")
        hearings = Hearing.objects.filter(case_id=case_id)
        serializer = HearingSerializer(hearings, many=True)

        if not hearings.exists():
            return Response({"error": "No hearings found for this case."}, status=status.HTTP_200_OK)
        return Response(serializer.data, status=status.HTTP_200_OK)