from django.shortcuts import render
from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from .models import CasePerson
from .serializers import CasePersonSerializer
from cases.models import Case

class CasePersonView(APIView):
    # Retrieve CasePersons by type (complainant or respondent)
    def get(self, request):
        case_person_type = request.query_params.get("type")
        case_complainants = []
        case_respondents = []
        
        for case in Case.objects.all():
            for complainant in case.complainants.all():
                if complainant not in case_complainants:
                    case_complainants.append(complainant)

            for respondent in case.respondents.all():
                if respondent not in case_respondents:
                    case_respondents.append(respondent)

        case_persons = []
        if case_person_type == "complainant":
            case_persons = CasePerson.objects.filter(id__in=[c.id for c in case_complainants])
        elif case_person_type == "respondent":
            case_persons = CasePerson.objects.filter(id__in=[r.id for r in case_respondents])

        serializer = CasePersonSerializer(case_persons, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # Retrieve CasePersons by a list of IDs
    def post(self, request):
        try:
            ids = request.data.get("ids", [])
            case_persons = CasePerson.objects.filter(id__in=ids)
            serializer = CasePersonSerializer(case_persons, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
    def put(self, request, pk):
        try:
            case_person = CasePerson.objects.get(pk=pk)
        except CasePerson.DoesNotExist:
            return Response({"error": "CasePerson not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CasePersonSerializer(case_person, data=request.data, partial=True)

        if serializer.is_valid():
            case_person = serializer.save()
            case_person_data = CasePersonSerializer(case_person).data
            return Response(case_person_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SingleCasePersonView(APIView):
    def get(self, request, email):
        try:
            case_person = CasePerson.objects.get(email=email)
            serializer = CasePersonSerializer(case_person)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CasePerson.DoesNotExist:
            return Response({"error": "CasePerson not found."}, status=status.HTTP_404_NOT_FOUND)