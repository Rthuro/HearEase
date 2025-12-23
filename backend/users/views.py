from django.shortcuts import render
from rest_framework import generics, status
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from firebase_admin import auth
from rest_framework.authtoken.models import Token

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
            role = (
                "user" if user.is_user else
                "admin" if user.is_admin else
                "superadmin" if user.is_superadmin else
                "unknown"
            )
            return Response(
                {"message": "User registered successfully", 
                 "user": 
                    {
                        "id": user.id,
                        "email": user.email,
                        "role": role
                    }},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CheckEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"})
        return Response({"message": "Email is available"}, status=status.HTTP_200_OK)   

    
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            
            user_role_string = 'user'
            if getattr(user, 'is_admin', False) or getattr(user, 'is_superadmin', False):
                user_role_string = 'admin'
            
            return Response({
                "message": "Login successful",
                "user": 
                {
                    "id": user.id,
                    "email": user.email,
                    "role": user_role_string,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }, status=status.HTTP_200_OK)
        print(f"Login errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class FindUserView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email)
        if user.exists():
            return Response({"user": UserInfoSerializer(user.first()).data})
        return Response({"error": "User do not exist"}, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request):
        users = User.objects.all().exclude(is_admin=True, is_superadmin=True)
        serializer = UserInfoSerializer(users, many=True)
        return Response({"users": serializer.data}, status=status.HTTP_200_OK)

class UpdateUserView(APIView):
    permission_classes = [AllowAny]
    def put(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserInfoSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminView(APIView):
     def get(self, request):
        users = User.objects.all().exclude(is_user=True)
        serializer = UserInfoSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class GoogleLoginView(APIView):
    def post(self, request):
        id_token = request.data.get('token')
        
        if not id_token:
            return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Verify with Firebase
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token.get('uid')
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')

            # 2. Parse Name
            first_name = ""
            last_name = ""
            if name:
                parts = name.split(' ')
                first_name = parts[0]
                if len(parts) > 1:
                    last_name = ' '.join(parts[1:])

            # 3. Get or Create User
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:

                user = User.objects.create_user(
                    username=email,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    password=None,
                    is_user=True,   
                    is_active=True
                )

            # 4. Generate Django Token (Optional, if you use DRF tokens for API calls)
            token, _ = Token.objects.get_or_create(user=user)

            # 5. CONSTRUCT RESPONSE FOR ZUSTAND STORE
            user_role_string = 'user'
            if getattr(user, 'is_admin', False) or getattr(user, 'is_superadmin', False):
                user_role_string = 'admin'

            user_info = {
                'role': user_role_string, 
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'token': token.key, # Add token here if you need it for API calls later
                # Add any other fields your app uses from 'userInfo'
            }

            return Response({
                "message": "User registered successfully",
                'user': user_info
            }, status=status.HTTP_200_OK)

        except auth.InvalidIdTokenError as e:
            print(f"Firebase Token Verification Failed: {e}") 
            return Response({'error': 'Invalid Token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        