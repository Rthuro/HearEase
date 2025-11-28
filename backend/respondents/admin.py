from django.contrib import admin
from django import forms
from .models import Respondent

class RespondentForm(forms.ModelForm):
    class Meta:
        model = Respondent
        fields = "__all__"

# Register your models here.
class RespondentsAdmin(admin.ModelAdmin):
    form = RespondentForm
    list_display = [field.name for field in Respondent._meta.fields]


admin.site.register(Respondent, RespondentsAdmin)