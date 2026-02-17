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


class CalendarSyncSettings(models.Model):
    """
    Global settings for automatic Google Calendar sync.
    Only one record should exist (singleton pattern).
    """
    auto_sync_enabled = models.BooleanField(
        default=False,
        help_text="Enable automatic syncing of hearings to Google Calendar"
    )
    sync_on_create = models.BooleanField(
        default=True,
        help_text="Sync when a new hearing is created"
    )
    sync_on_update = models.BooleanField(
        default=True,
        help_text="Sync when a hearing is updated"
    )
    sync_on_delete = models.BooleanField(
        default=True,
        help_text="Remove from calendar when a hearing is deleted"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Calendar Sync Settings"
        verbose_name_plural = "Calendar Sync Settings"

    def __str__(self):
        status = "Enabled" if self.auto_sync_enabled else "Disabled"
        return f"Calendar Sync Settings ({status})"


class UserCalendarSyncPreference(models.Model):
    """
    Per-user sync filter preferences for Google Calendar.
    Controls which hearings get synced to a user's calendar.
    """
    SYNC_FILTER_CHOICES = [
        ("all", "All Hearings"),
        ("my_hearings", "Only My Hearings"),
        ("selected", "Selected Hearings Only"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="calendar_sync_preference"
    )
    sync_filter = models.CharField(
        max_length=20,
        choices=SYNC_FILTER_CHOICES,
        default="my_hearings",
        help_text="Which hearings to sync to this user's Google Calendar"
    )
    selected_hearing_ids = models.JSONField(
        default=list,
        blank=True,
        help_text="List of hearing IDs to sync (only used when sync_filter='selected')"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Sync Preference for {self.user.email}: {self.get_sync_filter_display()}"
