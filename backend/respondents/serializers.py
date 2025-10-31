from rest_framework import serializers
from .models import Respondent

class RespondentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Respondent
        fields = [
            'id',
            'first_name',
            'last_name',
            'middle_name',
            'birth_date',
            'sex',
            'contact_number',
            'barangay',
            'street',
            'additional_info',
        ]

        