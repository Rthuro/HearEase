from django.contrib import admin
from django.utils.html import format_html
from .models import Document


class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "case", "uploaded_at", "file_link")
    list_filter = ("uploaded_at", "case__case_status")
    search_fields = ("title", "case__id", "case__case_type__case_name")
    ordering = ("-uploaded_at",)
    readonly_fields = ("uploaded_at", "file_preview")

    fieldsets = (
        ("Document Details", {
            "fields": ("title", "case", "file", "file_preview")
        }),
        ("Timestamps", {
            "fields": ("uploaded_at",)
        }),
    )

    def file_link(self, obj):
        """Show a clickable link to open or download the file."""
        if obj.file:
            return format_html('<a href="{}" target="_blank">Open File</a>', obj.file.url)
        return "No file"
    file_link.short_description = "File Link"

    def file_preview(self, obj):
        """Optional: show image preview if the file is an image."""
        if obj.file and obj.file.url.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            return format_html('<img src="{}" width="150" style="border-radius:8px;"/>', obj.file.url)
        return "No preview available"
    file_preview.short_description = "Preview"


admin.site.register(Document, DocumentAdmin)
