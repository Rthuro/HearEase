from django.shortcuts import render
from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from .models import CaseOrganization
from .serializers import CaseOrganizationSerializer
from cases.models import Case

class CaseOrganizationView(APIView):
    # Retrieve CaseOrganizations by type (complainant or respondent)
    def get(self, request):
        case_organization_type = request.query_params.get("type")
        case_complainants = []
        case_respondents = []
        
        for case in Case.objects.all():
            for complainant in case.complainant_organizations.all():
                if complainant not in case_complainants:
                    case_complainants.append(complainant)

            for respondent in case.respondent_organizations.all():
                if respondent not in case_respondents:
                    case_respondents.append(respondent)

        case_organizations = []
        if case_organization_type == "complainant":
            case_organizations = CaseOrganization.objects.filter(id__in=[c.id for c in case_complainants])
        elif case_organization_type == "respondent":
            case_organizations = CaseOrganization.objects.filter(id__in=[r.id for r in case_respondents])

        serializer = CaseOrganizationSerializer(case_organizations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # Retrieve CaseOrganizations by a list of IDs
    def post(self, request):
        try:
            ids = request.data.get("ids", [])
            case_organizations = CaseOrganization.objects.filter(id__in=ids)
            serializer = CaseOrganizationSerializer(case_organizations, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
    def put(self, request, pk):
        try:
            case_organization = CaseOrganization.objects.get(pk=pk)
        except CaseOrganization.DoesNotExist:
            return Response({"error": "Case Organization not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CaseOrganizationSerializer(case_organization, data=request.data, partial=True)

        if serializer.is_valid():
            case_organization = serializer.save()
            case_organization_data = CaseOrganizationSerializer(case_organization).data
            return Response(case_organization_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SingleCaseOrganizationView(APIView):
    def get(self, request, email):
        try:
            case_organization = CaseOrganization.objects.get(email=email)
            serializer = CaseOrganizationSerializer(case_organization)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CaseOrganization.DoesNotExist:
            return Response({"error": "Case Organization not found."}, status=status.HTTP_404_NOT_FOUND)