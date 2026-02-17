from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import SupportTicket
from .serializers import (
    SupportTicketSerializer,
    CreateTicketSerializer,
    UpdateTicketStatusSerializer,
)


class UserTicketView(APIView):
    """
    User endpoint to list own tickets (GET) or create a new ticket (POST).
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = SupportTicket.objects.filter(user=request.user)
        serializer = SupportTicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CreateTicketSerializer(data=request.data)
        if serializer.is_valid():
            ticket = serializer.save(user=request.user)
            return Response(
                SupportTicketSerializer(ticket).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminTicketListView(APIView):
    """
    Admin endpoint to list all tickets with optional status filter.
    GET /api/tickets/all/?status=open
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_admin:
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN,
            )

        tickets = SupportTicket.objects.all()

        # Optional status filter
        status_filter = request.query_params.get("status")
        if status_filter:
            tickets = tickets.filter(status=status_filter)

        serializer = SupportTicketSerializer(tickets, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminTicketActionView(APIView):
    """
    Admin endpoint to update a ticket's status with an optional reason.
    PUT /api/tickets/<id>/action/
    Body: { "status": "accepted", "admin_reason": "We will look into this." }
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        if not request.user.is_admin:
            return Response(
                {"error": "Admin access required"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = SupportTicket.objects.get(pk=pk)
        except SupportTicket.DoesNotExist:
            return Response(
                {"error": "Ticket not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = UpdateTicketStatusSerializer(data=request.data)
        if serializer.is_valid():
            ticket.status = serializer.validated_data["status"]
            ticket.admin_reason = serializer.validated_data.get("admin_reason", "")
            ticket.resolved_by = request.user
            ticket.save()

            return Response(
                SupportTicketSerializer(ticket).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
