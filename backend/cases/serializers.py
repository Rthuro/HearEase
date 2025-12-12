from respondents.models import Respondent
from complainants.models import Complainant
from rest_framework import serializers
from .models import Case, CaseType, SettlementType, Relationship

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
    complainants = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Complainant.objects.all()
    )
    respondents = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Respondent.objects.all()
    )

    class Meta:
        model = Case
        fields = '__all__'

class ReportSerializer(serializers.Serializer):
    month = serializers.CharField()
    pending = serializers.IntegerField()
    approved = serializers.IntegerField()
    resolved = serializers.IntegerField()