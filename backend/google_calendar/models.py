"""
Google Calendar Integration Models
Stores OAuth tokens and sync state for users.
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class GoogleCalendarToken(models.Model):
    """
    Stores OAuth2 tokens for Google Calendar access.
    One token per user (admin/lupon can sync, users can view).
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="google_calendar_token"
    )
    access_token = models.TextField()
    refresh_token = models.TextField()
    token_expiry = models.DateTimeField()
    calendar_id = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Google Calendar Token for {self.user.email}"


class CalendarSyncLog(models.Model):
    """
    Tracks sync operations for debugging and audit.
    """
    ACTION_CHOICES = [
        ("create", "Created"),
        ("update", "Updated"),
        ("delete", "Deleted"),
        ("error", "Error"),
    ]

    hearing = models.ForeignKey(
        "hearings.Hearing",
        on_delete=models.CASCADE,
        null=True,
        related_name="sync_logs"
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES,default="create")
    google_event_id = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} - Hearing #{self.hearing.id}"
