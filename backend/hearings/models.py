from django.db import models
from cases.models import Case
from lupon_members.models import LuponMember
from case_persons.models import CasePerson

class Hearing(models.Model):
    # --- Status choices (sync with frontend)
    HEARING_STATUS_CHOICES = [
        ("filed", "Filed"),
        ("pending_schedule", "Pending Schedule"),
        ("scheduled", "Scheduled"),
        ("rescheduled", "Rescheduled"),
        ("cancelled", "Cancelled"),
        ("completed", "Completed"),
        ("pending_decision", "Pending Decision"),
    ]

    # --- Relationships
    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name="hearings"
    )
    lupon_member = models.ForeignKey(
        LuponMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="hearings"
    )

    # --- Hearing details
    hearing_date = models.DateField(blank=True, null=True)
    time = models.TimeField(blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    hearing_status = models.CharField(
        max_length=20,
        choices=HEARING_STATUS_CHOICES,
        default="pending_schedule"
    )
    hearing_number = models.IntegerField(blank=True, null=True)
    time_completed = models.TimeField(blank=True, null=True)
    
    # --- Google Calendar sync
    google_event_id = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hearing for Case #{self.case.id} on {self.hearing_date} ({self.get_hearing_status_display()})"

class HearingAttendance(models.Model):
    ATTENDANCE_STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
        ("excused", "Excused"),
    ]

    PARTICIPANT_TYPE_CHOICES = [
        ("lupon", "Lupon Member"),
        ("complainant", "Complainant"),
        ("respondent", "Respondent"),
    ]

    hearing = models.ForeignKey(
        Hearing, 
        on_delete=models.CASCADE,
        related_name="attendances"
    )

    participant_role = models.CharField(
        max_length=20,
        choices=PARTICIPANT_TYPE_CHOICES
    )

    lupon_member = models.ForeignKey(
        LuponMember, 
        on_delete=models.CASCADE, 
        null=True, blank=True, 
        related_name="lupon_attendances"
    )

    case_person = models.ForeignKey(
        CasePerson,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="case_person_attendances"
    )

    attendance_status = models.CharField(
        max_length=10,
        choices=ATTENDANCE_STATUS_CHOICES,
        default="present"
    )
    
    remarks = models.TextField(blank=True, null=True, help_text="Reason for absence or other notes")

    class Meta:
        verbose_name_plural = "Hearing Attendances"

    def __str__(self):
        name = "Unknown"
        if self.lupon_member:
            name = str(self.lupon_member)
        elif self.case_person:
            name = f"{self.case_person.first_name} {self.case_person.last_name}"
            
        return f"{name} ({self.participant_role}) - {self.attendance_status}"