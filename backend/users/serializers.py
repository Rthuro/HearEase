from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth import authenticate

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'role',
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

    def create(self, validated_data):
        user = User(**validated_data)  
        user.set_password(validated_data.get('password'))  
        user.save()  
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        data["user"] = user
        return data
    
class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'role',
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

    
