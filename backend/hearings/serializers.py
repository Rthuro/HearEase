from rest_framework import serializers
from .models import Hearing
from lupon_members.serializers import LuponMemberSerializer
from cases.serializers import CaseSerializer

class HearingSerializer(serializers.ModelSerializer):
    # lupon_member = LuponMemberSerializer(read_only=True)
    # case = CaseSerializer(many=True, read_only=True)

    class Meta:
        model = Hearing
        fields = '__all__'
        # fields = [
        #     "id",
        #     "case",
        #     "hearing_date",
        #     "time",
        #     "lupon_member", 
        #     "remarks",
        #     "hearing_status",
        # ]