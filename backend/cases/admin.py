from django.contrib import admin
from django import forms
from .models import Case, CaseType, SettlementType


# ----- CaseType Admin -----
class CaseTypeAdmin(admin.ModelAdmin):
    list_display = ("case_name", "severity", "description")
    search_fields = ("case_name",)
    list_filter = ("severity",)
    ordering = ("severity",)


# ----- SettlementType Admin -----
class SettlementTypeAdmin(admin.ModelAdmin):
    list_display = ("settlement_name", "description")
    search_fields = ("settlement_name",)
    ordering = ("settlement_name",)


# ----- Custom Case Form -----
class CaseForm(forms.ModelForm):
    class Meta:
        model = Case
        fields = "__all__"


# ----- Case Admin -----
class CaseAdmin(admin.ModelAdmin):
    form = CaseForm
    list_display = (
        "id",
        "case_type",
        "settlement_type",
        "get_complainants",
        "get_respondents",
        "case_status",
        "is_active",
        "date_filed",
    )
    list_filter = (
        "case_status",
        "is_active",
        "case_type",
        "settlement_type",
    )
    search_fields = (
        "id",
        "case_type__case_name",
        "get_complainants",
        "get_respondents",
    )
    fieldsets = (
        ("Case Information", {
            "fields": (
                "id",
                "case_type",
                "settlement_type",
                "complainants",
                "respondents",
                "description",
                "remarks",
            )
        }),
        ("Status and Activity", {
            "fields": (
                "case_status",
                "is_active",
                "predicted_hearings",
            )
        }),
        ("Dates", {"fields": ("date_filed",)}),
    )
    readonly_fields = ("date_filed",)
    ordering = ("-date_filed",)
    
    def get_complainants(self, obj):
        return ", ".join([str(c) for c in obj.complainants.all()])
    get_complainants.short_description = "Complainants"

    def get_respondents(self, obj):
        return ", ".join([str(r) for r in obj.respondents.all()])
    get_respondents.short_description = "Respondents"


# ----- Register Models -----
admin.site.register(Case, CaseAdmin)
admin.site.register(CaseType, CaseTypeAdmin)
admin.site.register(SettlementType, SettlementTypeAdmin)
