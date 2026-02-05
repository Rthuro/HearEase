from django.db import models
from cases.models import Case
from lupon_members.models import LuponMember


class Hearing(models.Model):
    # --- Status choices (sync with frontend)
    HEARING_STATUS_CHOICES = [
        ("filed", "Filed"),
        ("pending_schedule", "Pending Schedule"),
        ("scheduled", "Scheduled"),
        ("rescheduled", "Rescheduled"),
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
    
    # --- Google Calendar sync
    google_event_id = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hearing for Case #{self.case.id} on {self.hearing_date} ({self.get_hearing_status_display()})"


class NonWorkingDay(models.Model):
    """
    Tracks days when the barangay is closed (holidays, typhoons, events).
    Hearings on these days are automatically rescheduled.
    """
    REASON_CHOICES = [
        ("holiday", "Holiday"),
        ("typhoon", "Typhoon/Weather"),
        ("event", "Barangay Event"),
        ("other", "Other"),
    ]
    
    date = models.DateField(unique=True)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, default="holiday")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        verbose_name = "Non-Working Day"
        verbose_name_plural = "Non-Working Days"

    def __str__(self):
        return f"{self.date} - {self.get_reason_display()}"
