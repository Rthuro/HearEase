from django.shortcuts import render
from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from .models import Respondent
from .serializers import RespondentSerializer

class RespondentView(APIView):
    def get(self, request):
        respondents = Respondent.objects.all().order_by('first_name')
        serializer = RespondentSerializer(respondents, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = RespondentSerializer(data=request.data)

        if serializer.is_valid():
            # Save the Respondent
            respondent = serializer.save()

            response_data = RespondentSerializer(respondent).data
            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateRespondentView(APIView):
    def put(self, request, pk):
        try:
            respondent = Respondent.objects.get(pk=pk)
        except Respondent.DoesNotExist:
            return Response({"error": "Respondent not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = RespondentSerializer(respondent, data=request.data, partial=True)

        if serializer.is_valid():
            respondent = serializer.save()
            response_data = RespondentSerializer(respondent).data
            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
        