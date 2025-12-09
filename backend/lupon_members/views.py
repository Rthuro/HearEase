from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from .models import LuponMember, Schedule
from .serializers import LuponMemberSerializer
from cases.models import Case
from cases.serializers import CaseSerializer
from hearings.models import Hearing
from hearings.serializers import HearingSerializer

class LuponMemberView(APIView):
    def get(self, request):
        members = LuponMember.objects.all().order_by('first_name')
        serializer = LuponMemberSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = LuponMemberSerializer(data=request.data)

        if serializer.is_valid():
            # Save the LuponMember
            member = serializer.save()

            # Check if sched was sent from frontend
            sched_data = request.data.get("sched", [])
            if isinstance(sched_data, list) and len(sched_data) > 0:
                for day in sched_data:
                    # Only add valid days
                    if day in dict(Schedule.DAYS):
                        Schedule.objects.create(lupon_member=member, day=day)

            # Return updated serialized data (with schedules included)
            response_data = LuponMemberSerializer(member).data
            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LuponPageView(APIView):
    def get(self, request):
        lupon_id = request.query_params.get('id')
        try:
            member = LuponMember.objects.get(pk=lupon_id)
        except LuponMember.DoesNotExist:
            return Response({"detail": "Lupon Member not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = LuponMemberSerializer(member)
        assigned_hearing = Hearing.objects.filter(lupon_member_id=lupon_id)
        hearing_serializer = HearingSerializer(assigned_hearing, many=True)
        cases_ids = assigned_hearing.values_list('case_id', flat=True).distinct()
        cases = Case.objects.filter(id__in=cases_ids)
        case_serializer = CaseSerializer(cases, many=True)

        data = {
            "lupon": serializer.data,
            "cases": case_serializer.data,
            "hearings": hearing_serializer.data
        }

        return Response(data, status=status.HTTP_200_OK)
    
class LuponDeleteView(APIView):
    def delete(self, request):
        member = request.data.get("id")

        try:
            lupon = LuponMember.objects.get(id=member)
            lupon.delete()
            return Response({"message": "Lupon has been removed"}, status=status.HTTP_204_NO_CONTENT)
        except LuponMember.DoesNotExist:
            return Response({"error": "Lupon member not found"}, status=status.HTTP_404_NOT_FOUND)

class UpdateLuponView(APIView):
    def put(self, request, pk=None):
        try:
            lupon = LuponMember.objects.get(pk=pk)
        except LuponMember.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = LuponMemberSerializer(lupon, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)