from django.shortcuts import render
from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from .models import CasePerson
from .serializers import CasePersonSerializer
from cases.models import Case
from django.db.models import Q
from cases.serializers import CaseSerializer
from users.utils import EmailNotification

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
        print(serializer.data)
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
    
    def delete(self, request, pk):
        try:
            case_person = CasePerson.objects.get(pk=pk)
            case_person.delete()
            return Response({"message": "CasePerson deleted successfully."}, status=status.HTTP_200_OK)
        except CasePerson.DoesNotExist:
            return Response({"error": "CasePerson not found."}, status=status.HTTP_404_NOT_FOUND)
        

class CasePersonListView(APIView):
    def get(self, request):
        case_person_type = request.query_params.get("type")
        
        # Optimized Database Queries (No loops needed!)
        if case_person_type == "complainant":
            # Find persons who are in the 'complainants' relationship of ANY case
            case_persons = CasePerson.objects.filter(cases_as_complainant__isnull=False).distinct()
            
        elif case_person_type == "respondent":
            # Find persons who are in the 'respondents' relationship of ANY case
            case_persons = CasePerson.objects.filter(cases_as_respondent__isnull=False).distinct()
            
        else:
            # Return everyone if no type specified
            case_persons = CasePerson.objects.all()

        serializer = CasePersonSerializer(case_persons, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class SingleCasePersonView(APIView):
    def get(self, request, email):
        try:
            case_person = CasePerson.objects.get(email=email)
            serializer = CasePersonSerializer(case_person)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CasePerson.DoesNotExist:
            return Response({"error": "CasePerson not found."}, status=status.HTTP_404_NOT_FOUND)

class AllCasePersonsView(APIView):
    def get(self, request):
        # 1. Fetch Persons with their cases pre-loaded
        # 'cases_as_complainant' and 'cases_as_respondent' are the related_names from your Case model
        persons = CasePerson.objects.all()

        results = []

        all_cases = Case.objects.all().prefetch_related('complainants', 'respondents')
        
        for person in persons:
            cases_count = 0   
            if person.cases_as_complainant.exists() or person.cases_as_respondent.exists():
                cases_count = all_cases.filter(
                    Q(complainants=person) | Q(respondents=person)
                ).distinct().count()

            results.append({
                "id": person.id,
                "first_name": person.first_name,
                "last_name": person.last_name,
                "email": person.email,
                "contact_number": person.contact_number,
                "has_account": bool(person.email),
                "cases": cases_count
            })
            cases_count = 0  # Reset count for next person
        return Response(results, status=status.HTTP_200_OK)
    
class CasePersonDetailsView(APIView):
    def get(self, request, pk):
        try:
            case_person = CasePerson.objects.get(pk=pk)
            serializer = CasePersonSerializer(case_person)

            cases = Case.objects.filter(
                Q(complainants=case_person) | Q(respondents=case_person)
            ).distinct()

            case_person_data = serializer.data
            case_person_data["cases"] = CaseSerializer(cases, many=True).data
            return Response(case_person_data, status=status.HTTP_200_OK)
        except CasePerson.DoesNotExist:
            return Response({"error": "CasePerson not found."}, status=status.HTTP_404_NOT_FOUND)
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
        
class CustomEmailView(APIView):
    def post(self, request):
        email = request.data.get("email")
        subject = request.data.get("subject")
        message = request.data.get("message")

        EmailNotification.custom_email(email, subject, message)
        
        return Response({"message": "Email sent successfully."}, status=status.HTTP_200_OK)