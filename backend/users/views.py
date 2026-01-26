import cv2
from django.shortcuts import render
from rest_framework import generics, status, permissions
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from firebase_admin import auth
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
import time
from django.utils import timezone
from datetime import timedelta
import random
from .models import OTP
from .utils import send_otp_email, send_otp_sms
import os
import uuid
import easyocr
from thefuzz import fuzz
from django.core.files.storage import default_storage
from deepface import DeepFace
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

reader = easyocr.Reader(['en'])

class VerifyIdentityView(APIView):
    """
    Identity verification view that:
    1. Extracts text from ID image using OCR
    2. Matches extracted names against provided names
    3. Verifies face match between ID photo and selfie
    """
    
    def preprocess_for_ocr(self, img, strategy='adaptive'):
        """
        Apply different preprocessing strategies for OCR.
        Returns preprocessed image.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        if strategy == 'adaptive':
            # Adaptive thresholding - good for varying lighting
            gray = cv2.GaussianBlur(gray, (3, 3), 0)
            processed = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
        elif strategy == 'otsu':
            # Otsu's thresholding - good for bimodal images
            gray = cv2.equalizeHist(gray)
            gray = cv2.bilateralFilter(gray, 9, 75, 75)
            _, processed = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        elif strategy == 'clahe':
            # CLAHE - Contrast Limited Adaptive Histogram Equalization
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            processed = clahe.apply(gray)
        elif strategy == 'morph':
            # Morphological operations - good for noisy images
            gray = cv2.GaussianBlur(gray, (5, 5), 0)
            _, processed = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
            processed = cv2.morphologyEx(processed, cv2.MORPH_CLOSE, kernel)
        else:
            # No preprocessing - use grayscale as is
            processed = gray
            
        return processed
    
    def extract_text_with_strategies(self, img_path, img_cv2):
        """
        Try multiple OCR strategies and return the one with most text.
        """
        strategies = ['clahe', 'adaptive', 'otsu', 'morph', 'none']
        best_text = ""
        best_result = []
        
        for strategy in strategies:
            try:
                processed = self.preprocess_for_ocr(img_cv2.copy(), strategy)
                temp_path = img_path.replace('.jpg', f'_ocr_{strategy}.jpg')
                cv2.imwrite(temp_path, processed)
                
                result = reader.readtext(temp_path, detail=0)
                text = " ".join(result).upper()
                
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                
                # Keep the result with most characters
                if len(text) > len(best_text):
                    best_text = text
                    best_result = result
                    
            except Exception as e:
                print(f"OCR strategy {strategy} failed: {e}")
                continue
        
        return best_text, best_result
    
    def match_name_in_text(self, name, ocr_text):
        """
        Check if a name appears in OCR text using multiple matching strategies.
        Returns (match_found, confidence_score)
        """
        if not name or not ocr_text:
            return False, 0
            
        name = name.upper().strip()
        ocr_text = ocr_text.upper()
        
        # Strategy 1: Direct substring match
        if name in ocr_text:
            return True, 100
        
        # Strategy 2: Fuzzy matching on the full text
        from thefuzz import fuzz
        ratio = fuzz.partial_ratio(name, ocr_text)
        if ratio >= 75:
            return True, ratio
        
        # Strategy 3: Word-by-word matching (handles OCR errors)
        name_words = name.split()
        ocr_words = ocr_text.split()
        matched_words = 0
        
        for name_word in name_words:
            if len(name_word) < 2:  # Skip single characters
                continue
            for ocr_word in ocr_words:
                word_ratio = fuzz.ratio(name_word, ocr_word)
                if word_ratio >= 80:
                    matched_words += 1
                    break
        
        if len(name_words) > 0 and matched_words >= len(name_words) * 0.5:
            confidence = int((matched_words / len(name_words)) * 100)
            return True, min(confidence, 95)
        
        return False, ratio

    def post(self, request):
        id_image = request.FILES.get('id_image')
        user_image = request.FILES.get('user_image')

        input_first_name = request.data.get('first_name', '').upper().strip()
        input_last_name = request.data.get('last_name', '').upper().strip()
        input_middle_name = request.data.get('middle_name', '').upper().strip()
        
        print(f"DEBUG Input Names: First: {input_first_name}, Middle: {input_middle_name}, Last: {input_last_name}")
        print("-------------------------------")
        
        if not id_image or not user_image:
            return Response({"error": "Missing images"}, status=400)

        # Generate unique file names
        id_name = f"tmp_{uuid.uuid4()}_id.jpg"
        user_name = f"tmp_{uuid.uuid4()}_user.jpg"

        id_path = default_storage.save(id_name, id_image)
        user_path = default_storage.save(user_name, user_image)

        abs_id_path = default_storage.path(id_path)
        abs_user_path = default_storage.path(user_path)
        
        # Create a copy of ID image for OCR (keep original for face detection)
        ocr_id_path = abs_id_path.replace('.jpg', '_ocr.jpg')

        try:
            id_img_cv2 = cv2.imread(abs_id_path)
            user_img_cv2 = cv2.imread(abs_user_path)

            if id_img_cv2 is None or user_img_cv2 is None:
                return Response({"error": "Failed to load image data"}, status=400)
            
            # Save a copy for OCR processing (keep original clean for face detection)
            cv2.imwrite(ocr_id_path, id_img_cv2)
            
            # ============ OCR TEXT EXTRACTION ============
            ocr_text, ocr_result = self.extract_text_with_strategies(ocr_id_path, id_img_cv2.copy())
            
            print(f"DEBUG OCR TEXT: {ocr_text}")
            print(f"DEBUG OCR WORDS: {ocr_result}")

            # ============ NAME MATCHING ============
            last_name_match, last_name_score = self.match_name_in_text(input_last_name, ocr_text)
            first_name_match, first_name_score = self.match_name_in_text(input_first_name, ocr_text)
            
            # Middle name is optional - boost score if it matches
            middle_name_match = False
            middle_name_score = 0
            if input_middle_name:
                middle_name_match, middle_name_score = self.match_name_in_text(input_middle_name, ocr_text)

            print(f"DEBUG NAME MATCH: Last={last_name_match}({last_name_score}%), First={first_name_match}({first_name_score}%), Middle={middle_name_match}({middle_name_score}%)")
            
            # Calculate overall name match
            # Require either: (last name matches well) OR (first + last both have reasonable scores)
            name_match_threshold = 60
            names_match = (
                (last_name_score >= name_match_threshold and first_name_score >= name_match_threshold) or
                (last_name_score >= 80) or  # Strong last name match is often sufficient
                (first_name_score >= 80 and last_name_score >= 50)  # Strong first name with weak last
            )
            
            avg_score = (last_name_score + first_name_score) / 2
            if input_middle_name and middle_name_match:
                avg_score = (last_name_score + first_name_score + middle_name_score) / 3
            
            if not names_match:
                return Response({
                    "error": "Name Mismatch",
                    "details": f"Provided name doesn't match ID text.",
                    "scores": {
                        "last_name": last_name_score,
                        "first_name": first_name_score,
                        "middle_name": middle_name_score if input_middle_name else None
                    },
                    "ocr_preview": ocr_text[:100]
                }, status=422)
            
            # ============ FACE VERIFICATION ============
            # Use ORIGINAL ID image (not the preprocessed one) for face detection
            result = DeepFace.verify(
                img1_path=abs_id_path,  # Original, unprocessed ID image
                img2_path=abs_user_path,
                detector_backend='opencv',
                enforce_detection=False
            )

            return Response({
                "verified": result['verified'],
                "similarity": 1 - result['distance'],
                "name_match_score": avg_score,
                "extracted_data": {
                    "last_name": input_last_name,
                    "given_names": input_first_name,
                    "middle_name": input_middle_name if input_middle_name else None,
                },
                "ocr_confidence": {
                    "last_name": last_name_score,
                    "first_name": first_name_score,
                    "middle_name": middle_name_score if input_middle_name else None
                }
            })

        except Exception as e:
            import traceback
            print(f"DEBUG Error: {traceback.format_exc()}")
            return Response({"error": str(e)}, status=500)
        
        finally:
            # Clean up all temporary files
            for path in [abs_id_path, abs_user_path, ocr_id_path]:
                if path and os.path.exists(path):
                    try:
                        os.remove(path)
                    except:
                        pass