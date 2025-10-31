from rest_framework.views import APIView 
from rest_framework.response import Response
from rest_framework import status
from .models import LuponMember, Schedule
from .serializers import LuponMemberSerializer

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
