
from django.shortcuts import render
from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from .models import Complainant
from .serializers import ComplainantSerializer

class ComplainantView(APIView):
    def get(self, request):
        complainants = Complainant.objects.all().order_by('first_name')
        serializer = ComplainantSerializer(complainants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ComplainantSerializer(data=request.data)

        if serializer.is_valid():
            # Save the Respondent
            complainant = serializer.save()

            complainant_data = ComplainantSerializer(complainant).data
            return Response(complainant_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

