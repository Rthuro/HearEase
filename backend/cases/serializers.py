from rest_framework import serializers
from .models import Case, CaseType, SettlementType, Relationship
from case_persons.serializers import CasePersonSerializer

class CaseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseType
        fields = '__all__'

class SettlementTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SettlementType
        fields = '__all__'

class RelationshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Relationship
        fields = '__all__'

class CaseSerializer(serializers.ModelSerializer):
    case_type = CaseTypeSerializer(read_only=True)
    settlement_type = SettlementTypeSerializer(read_only=True)
    relationship = RelationshipSerializer(read_only=True)
    complainants = CasePersonSerializer(many=True, read_only=True)
    respondents = CasePersonSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = '__all__'

class ReportSerializer(serializers.Serializer):
    month = serializers.CharField()
    pending = serializers.IntegerField()
    approved = serializers.IntegerField()
    resolved = serializers.IntegerField()