from rest_framework import serializers
from .models import CasePerson

class CasePersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = CasePerson
        fields = "__all__"

        