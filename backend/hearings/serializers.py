from rest_framework import serializers

from case_persons.serializers import CasePersonSerializer
from .models import Hearing, HearingAttendance
from lupon_members.serializers import LuponMemberSerializer
from cases.serializers import CaseSerializer

class HearingSerializer(serializers.ModelSerializer):
    # lupon_member = LuponMemberSerializer(read_only=True)
    # case = CaseSerializer(read_only=True)

    class Meta:
        model = Hearing
        fields = [
            "id",
            "case",
            "case_number",
            "case_type_label",
            "hearing_date",
            "hearing_number",
            "time",
            "lupon_member",
            "lupon_member_name",
            "remarks",
            "hearing_status",
            "created_at",
            "updated_at",
        ]
    
    def get_case_number(self, obj):
        """Get the case ID/number from the related case"""
        if obj.case:
            return obj.case.id
        return None
    
    def get_case_type_label(self, obj):
        """Get the case type name from the related case's case_type (without severity)"""
        if obj.case and hasattr(obj.case, 'case_type') and obj.case.case_type:
            # Use case_name directly to avoid including severity from __str__
            return obj.case.case_type.case_name if hasattr(obj.case.case_type, 'case_name') else None
        return None
    
    def get_lupon_member_name(self, obj):
        """Get the full name of the assigned Lupon member"""
        if obj.lupon_member:
            return f"{obj.lupon_member.first_name} {obj.lupon_member.last_name}"
        return None


class HearingAttendanceSerializer(serializers.ModelSerializer):
    case_person = CasePersonSerializer(read_only=True) 
    lupon_member = LuponMemberSerializer(read_only=True)
    class Meta:
            model = HearingAttendance
            fields = '__all__'
