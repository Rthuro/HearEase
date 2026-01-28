from rest_framework import serializers
from .models import CaseOrganization

class CaseOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseOrganization
        fields = "__all__"

        