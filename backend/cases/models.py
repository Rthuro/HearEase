from django.db import models
from users.models import User
from lupon_members.models import LuponMember
from case_persons.models import CasePerson


class CaseType(models.Model):
    case_name = models.CharField(max_length=100)
    severity = models.IntegerField(default=1)
    description = models.TextField(blank=True, null=True)
    is_custom = models.BooleanField(default=False)  # Track user-created custom case types

    def __str__(self):
        custom_marker = " [Custom]" if self.is_custom else ""
        return f"{self.case_name} (Severity {self.severity}){custom_marker}"


class SettlementType(models.Model):
    settlement_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.settlement_name

class Relationship(models.Model):
    relationship = models.CharField(max_length=100)

    def __str__(self):
        return self.relationship

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

    REJECTION_SECTION = [
        ("none", "None"),
        ("case_details", "Case Details"),
        ("complainant_info", "Complainant Information"),
        ("respondent_info", "Respondent Information")
    ]

    SUMMON_STATUS = [
        ("pending", "Pending"),
        ("served", "Served"),
        ("not_served", "Not Served"),
        ("pending", "Pending"),
    ]

    CFA = [
        ("municipal", "Municipal"),
        ("pnp", "PNP"),
        ("vawc", "VAWC"),
    ]

    CREATED = [
        ("user", "User"),
        ("admin", "Admin"),
    ]

    case_type = models.ForeignKey(
        CaseType, on_delete=models.SET_NULL, null=True, related_name="cases"
    )
    settlement_type = models.ForeignKey(
        SettlementType, on_delete=models.SET_NULL, null=True, related_name="cases"
    )

    relationship = models.ForeignKey(
        Relationship, on_delete=models.SET_NULL, null=True, related_name="cases"
    )

    complainants = models.ManyToManyField(CasePerson, related_name="cases_as_complainant")
    respondents = models.ManyToManyField(CasePerson, related_name="cases_as_respondent")

    case_status = models.CharField(
        max_length=20,
        choices=CASE_STATUS_CHOICES,
        default="pending_approval",
    )

    id = models.CharField(primary_key=True, max_length=36)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    date_filed = models.DateTimeField(auto_now_add=True)
    predicted_hearings = models.IntegerField(blank=True, null=True)
    actual_hearings = models.IntegerField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    rejection_section = models.CharField(
        max_length=30,
        choices=REJECTION_SECTION,
        blank=True,
        null=True,
        default="none",
    )

    summon_date_received = models.DateTimeField(blank=True, null=True)
    summon_received_by = models.CharField(max_length=100, blank=True, null=True)
    summon_status = models.CharField(
        max_length=20,
        choices=SUMMON_STATUS,
        default="pending",
    )

    cfa_destination = models.CharField( max_length=20, choices=CFA,
        default="none",
        blank=True,
        null=True,
    )

    case_completed_date = models.DateTimeField(blank=True, null=True)
    approved_case_date = models.DateTimeField(blank=True, null=True)
    rejected_case_date = models.DateTimeField(blank=True, null=True)

    create_by = models.CharField( max_length=20, choices=CREATED,
        default="none",
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"Case #{self.id} - {self.case_type.case_name if self.case_type else 'Unknown'} ({self.get_case_status_display()})"
