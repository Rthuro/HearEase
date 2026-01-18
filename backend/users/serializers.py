from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import NotificationPreference


User = get_user_model()

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['allow_email', 'allow_sms', 'allow_push']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = '__all__'

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        data["user"] = user
        return data
    
class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

        # fields = [
        #     'id',
        #     'email',
        #     'password',
        #     'role',
        #     'first_name',
        #     'last_name',
        #     'middle_name',
        #     'birth_date',
        #     'sex',
        #     'contact_number',
        #     'barangay',
        #     'street',
        #     'additional_info',
        # ]

    
