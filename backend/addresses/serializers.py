from rest_framework import serializers
from .models import Barangay, Street

class StreetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Street
        fields = '__all__'


class BarangaySerializer(serializers.ModelSerializer):
    streets = StreetSerializer(many=True, read_only=True)

    class Meta:
        model = Barangay
        fields = '__all__'