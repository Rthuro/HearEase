from respondents.serializers import RespondentSerializer
from users.serializers import UserInfoSerializer
from rest_framework import serializers
from .models import Case, CaseType, SettlementType

class CaseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseType
        fields = '__all__'

class SettlementTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SettlementType
        fields = '__all__'

class CaseSerializer(serializers.ModelSerializer):
    case_type = CaseTypeSerializer(read_only=True)
    settlement_type = SettlementTypeSerializer(read_only=True)
    complainant_user = UserInfoSerializer(read_only=True)
    respondent_user = RespondentSerializer(read_only=True)

    class Meta:
        model = Case
        fields = '__all__'
