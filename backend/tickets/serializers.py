from rest_framework import serializers
from .models import SupportTicket


class SupportTicketSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(
        source="get_status_display", read_only=True
    )
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )
    resolved_by_email = serializers.EmailField(
        source="resolved_by.email", read_only=True, default=None
    )

    class Meta:
        model = SupportTicket
        fields = [
            "id",
            "user",
            "user_email",
            "user_name",
            "subject",
            "description",
            "category",
            "category_display",
            "status",
            "status_display",
            "admin_reason",
            "resolved_by",
            "resolved_by_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "admin_reason",
            "resolved_by",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        u = obj.user
        name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return name if name else u.email


class CreateTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = ["subject", "description", "category"]


class UpdateTicketStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=["accepted", "declined", "in_progress", "resolved", "dropped"]
    )
    admin_reason = serializers.CharField(required=False, allow_blank=True, default="")
