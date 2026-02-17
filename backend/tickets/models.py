from django.db import models
from django.conf import settings


class SupportTicket(models.Model):
    STATUS_CHOICES = [
        ("open", "Open"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("dropped", "Dropped"),
    ]

    CATEGORY_CHOICES = [
        ("general", "General"),
        ("bug", "Bug Report"),
        ("account", "Account Issue"),
        ("feature", "Feature Request"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="support_tickets",
    )
    subject = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20, choices=CATEGORY_CHOICES, default="general"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="open"
    )
    admin_reason = models.TextField(blank=True, null=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_tickets",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Ticket #{self.id} - {self.subject} ({self.get_status_display()})"
