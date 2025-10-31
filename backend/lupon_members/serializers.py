# lupon_members/serializers.py
from rest_framework import serializers
from .models import LuponMember, Schedule


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'day']


class LuponMemberSerializer(serializers.ModelSerializer):
    schedules = ScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = LuponMember
        # field = '__all__'
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
            'sched',       # from JSONField
            'schedules',   # related Schedule objects
        ]
