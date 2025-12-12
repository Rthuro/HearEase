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

class UpdateHearingView(APIView):
    def post(self, request, pk):
        case_id = pk 
        hearings_data = request.data.get("hearings", [])

        print("Case ID:", case_id)
        print("Received Data:", hearings_data)

        try:
            case = Case.objects.get(id=case_id)
            
            for h_data in hearings_data:

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
                    case=case,  
                    hearing_number=h_number,
                    hearing_date=clean_date, 
                    time=h_data.get("time"),
                    lupon_member_id=lupon_id,
                    remarks=current_remarks,
                    hearing_status=current_status,
                )

            return Response({"success": "Hearings successfully created."}, status=status.HTTP_200_OK)

        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print("Error saving hearing:", str(e)) 
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)