from django.db import models
from users.models import User
from complainants.models import Complainant
from respondents.models import Respondent
from lupon_members.models import LuponMember


class CaseType(models.Model):
    case_name = models.CharField(max_length=100)
    severity = models.IntegerField(default=1)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.case_name} (Severity {self.severity})"


class SettlementType(models.Model):
    settlement_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.settlement_name


class Case(models.Model):

    CASE_STATUS_CHOICES = [
        ("filed", "Filed"),
        ("pending_approval", "Pending Approval"),
        ("approved", "Approved"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("escalated", "Escalated"),
        ("rejected", "Rejected"),
        ("cancelled", "Cancelled"),
    ]

    case_type = models.ForeignKey(
        CaseType, on_delete=models.SET_NULL, null=True, related_name="cases"
    )
    settlement_type = models.ForeignKey(
        SettlementType, on_delete=models.SET_NULL, null=True, related_name="cases"
    )
    
    complainant_user = models.ForeignKey(
        User, on_delete=models.CASCADE
    )
    respondent_user = models.ForeignKey(
        Respondent, on_delete=models.CASCADE
    )

    case_status = models.CharField(
        max_length=20,
        choices=CASE_STATUS_CHOICES,
        default="filed"
    )

    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    date_filed = models.DateTimeField(auto_now_add=True)
    co_complainants_ids = models.JSONField(blank=True, null=True)


    def __str__(self):
        return f"Case #{self.id} - {self.case_type.case_name if self.case_type else 'Unknown'} ({self.get_case_status_display()})"
