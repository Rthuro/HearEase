from rest_framework import serializers
from .models import DocumentTemplate, GeneratedDocument

class DocumentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = '__all__'


class GenerateDocumentSerializer(serializers.Serializer):
    template_id = serializers.IntegerField()
    data = serializers.JSONField()
    
    # Example data structure for summon letter:
    # {
    #     "date_generated": "2025-10-30",
    #     "respondent_name": "Juan Dela Cruz",
    #     "respondent_address": "123 Main St, Tetuan",
    #     "complainant_name": "Maria Santos",
    #     "nature_of_complaint": "Property Dispute",
    #     "case_number": "BRG-2025-001",
    #     "hearing_date": "2025-11-15",
    #     "time_slot": "2:00 PM",
    #     "lupon_member": "Kagawad Juan Reyes"
    # }


class GeneratedDocumentSerializer(serializers.ModelSerializer):
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = GeneratedDocument
        fields = '__all__'