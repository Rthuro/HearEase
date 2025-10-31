from rest_framework import serializers
from .models import Complainant

class ComplainantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complainant
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

        