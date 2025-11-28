from django.contrib import admin
from django import forms
from .models import Complainant

class ComplainantForm(forms.ModelForm):
    class Meta:
        model = Complainant
        fields = "__all__"

# Register your models here.
class ComplainantsAdmin(admin.ModelAdmin):
    form = ComplainantForm
    list_display = [field.name for field in Complainant._meta.fields]


admin.site.register(Complainant, ComplainantsAdmin)