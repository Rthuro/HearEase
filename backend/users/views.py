from django.shortcuts import render
from rest_framework import generics, status
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializers import RegisterSerializer, LoginSerializer, UserInfoSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User registered successfully", 
                 "user": RegisterSerializer(user).data},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CheckEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if User.objects.filter(username=email).exists():
            return Response({"error": "Email already exists"})
        return Response({"message": "Email is available"}, status=status.HTTP_200_OK)   

    
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            return Response({
                "message": "Login successful",
                "user": 
                {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role
                }
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class FindUserView(APIView):
    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(username=email)
        if user.exists():
            return Response({"user": UserInfoSerializer(user.first()).data})
        return Response({"error": "User do not exist"}, status=status.HTTP_400_BAD_REQUEST)
