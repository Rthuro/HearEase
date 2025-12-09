from django.shortcuts import render
from .models import Hearing
from cases.models import Case
from complainants.models import Complainant
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
        first_name = request.query_params.get("first_name")
        last_name = request.query_params.get("last_name")

        if role == "user":
            try:
                user_id = Complainant.objects.filter(first_name=first_name, last_name=last_name).first().id
                cases = Case.objects.filter(complainants=user_id)
            except AttributeError:
                cases = Case.objects.none()
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
    
    def put(self, request, pk):
        try:
            hearing = Hearing.objects.get(pk=pk)
        except Hearing.DoesNotExist:
            return Response({"error": "Hearing not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = HearingSerializer(hearing, data=request.data, partial=True)

        if serializer.is_valid():
            hearing = serializer.save()
            response_data = HearingSerializer(hearing).data
            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)