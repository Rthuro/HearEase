from django.shortcuts import render
from rest_framework import generics, status, permissions
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from firebase_admin import auth
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
import random
from .models import OTP
from .utils import send_otp_email, send_otp_sms
import os
from .serializers import RegisterSerializer, LoginSerializer, UserInfoSerializer, NotificationPreferenceSerializer
from django.core.files.base import ContentFile

User = get_user_model()

class UserNotificationSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.notification_preferences

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
                    'middle_name': user.middle_name,
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
                'middle_name': user.middle_name,
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

class SendOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        otp_type = request.data.get('type') 
        contact_number = request.data.get('contact_number', None) 
        code = str(random.randint(100000, 999999))
        
        expires_at = timezone.now() + timedelta(minutes=10)

        OTP.objects.update_or_create(
            user=user,
            otp_type=otp_type,
            defaults={'code': code, 'expires_at': expires_at}
        )

        try:
            if otp_type == "phone":
                send_otp_sms(contact_number, code)
            elif otp_type == "email":
                send_otp_email(user.email, code)

            return Response({"message": "OTP sent successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Failed to send OTP"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        code = request.data.get('code')
        otp_type = request.data.get('type')

        try:
            otp_record = OTP.objects.get(user=user, otp_type=otp_type)
        except OTP.DoesNotExist:
            return Response({"error": "No OTP requested"}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > otp_record.expires_at:
            return Response({"error": "Code has expired"}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.code == code:

            if otp_type == "phone":
                user.is_phone_verified = True
            elif otp_type == "email":
                user.is_email_verified = True

            user.save()
        
            otp_record.delete()
            
            return Response({"message": "Verified successfully!"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid code"}, status=status.HTTP_400_BAD_REQUEST)
    permission_classes = [IsAuthenticated] 


class VerifyIdentityView(APIView):
    def post(self, request):
        import cv2
        import uuid
        from thefuzz import fuzz
        from django.core.files.storage import default_storage
        
        import easyocr
        from deepface import DeepFace

        id_image = request.FILES.get('id_image')
        user_image = request.FILES.get('user_image')

        input_first_name = request.data.get('first_name', '').upper().strip()
        input_last_name = request.data.get('last_name', '').upper().strip()
        print(f"DEBUG Input Names: First Name: {input_first_name}, Last Name: {input_last_name}")
        print("-------------------------------")
        if not id_image or not user_image:
            return Response({"error": "Missing images"}, status=400)

        id_name = f"tmp_{uuid.uuid4()}_id.jpg"
        user_name = f"tmp_{uuid.uuid4()}_user.jpg"

        id_path = default_storage.save(id_name, id_image)
        user_path = default_storage.save(user_name, user_image)

        abs_id_path = default_storage.path(id_path)
        abs_user_path = default_storage.path(user_path)

        try:
            reader = easyocr.Reader(['en'], gpu=False) 

            id_img_cv2 = cv2.imread(abs_id_path)
            user_img_cv2 = cv2.imread(abs_user_path)

            if id_img_cv2 is None or user_img_cv2 is None:
                return Response({"error": "Failed to load image data"}, status=400)
            
            gray = cv2.cvtColor(id_img_cv2, cv2.COLOR_BGR2GRAY)

            # Increase contrast
            gray = cv2.equalizeHist(gray)

            # Denoise
            gray = cv2.bilateralFilter(gray, 9, 75, 75)

            # Threshold
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

            cv2.imwrite(abs_id_path, thresh)

            ocr_result = reader.readtext(abs_id_path, detail=0)
            ocr_text = " ".join(ocr_result).upper()
            
            print(f"DEBUG OCR TEXT: {ocr_text}")

            last_name_score = fuzz.partial_ratio(input_last_name, ocr_text)
            first_name_score = fuzz.partial_ratio(input_first_name, ocr_text)

            name_match_threshold = 50
            names_match = (last_name_score >= name_match_threshold and 
                           first_name_score >= name_match_threshold)
            print(f"DEBUG NAME MATCH: {names_match} (Scores: Last Name {last_name_score}%, First Name {first_name_score}%)")
            
            if not names_match:
                return Response({
                    "error": "Name Mismatch",
                    "details": f"Provided name doesn't match ID text. (Match Score: {last_name_score}%)",
                    "ocr_preview": ocr_text[:50]
                }, status=422)
            
            # DeepFace Verification
            result = DeepFace.verify(
                img1_path=abs_id_path, 
                img2_path=abs_user_path,
                detector_backend='opencv', # Fast and free
                enforce_detection=False
            )

            return Response({
                "verified": result['verified'],
                "similarity": 1 - result['distance'],
                "extracted_data": {
                    "last_name": input_last_name,
                    "given_names": input_first_name,
                }
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
        finally:
            if os.path.exists(abs_id_path): os.remove(abs_id_path)
            if os.path.exists(abs_user_path): os.remove(abs_user_path)