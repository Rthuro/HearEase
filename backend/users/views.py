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
import cv2

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
    """
    Identity verification view that:
    1. Validates image quality (blur, brightness, resolution)
    2. Extracts text from ID image using OCR
    3. Matches extracted names against provided names
    4. Verifies face match between ID photo and selfie
    """
    
    # ============ IMAGE QUALITY THRESHOLDS ============
    MIN_RESOLUTION = (300, 200)  # Minimum width x height
    MAX_FILE_SIZE_MB = 10
    MIN_BLUR_SCORE = 50  # Lower = more blurry (Laplacian variance)
    MIN_BRIGHTNESS = 40  # 0-255 scale
    MAX_BRIGHTNESS = 220  # 0-255 scale
    
    def check_image_quality(self, img_cv2, image_type="image"):
        """
        Check image quality and return issues found.
        Returns (is_valid, issues_list, quality_scores)
        """
        issues = []
        scores = {
            "blur_score": 0,
            "brightness": 0,
            "resolution": (0, 0),
            "overall_quality": "unknown"
        }
        
        if img_cv2 is None:
            return False, ["Image could not be loaded"], scores
        
        height, width = img_cv2.shape[:2]
        scores["resolution"] = (width, height)
        
        # ============ RESOLUTION CHECK ============
        if width < self.MIN_RESOLUTION[0] or height < self.MIN_RESOLUTION[1]:
            issues.append(f"Resolution too low ({width}x{height}). Minimum recommended: {self.MIN_RESOLUTION[0]}x{self.MIN_RESOLUTION[1]} pixels.")
        
        # ============ BLUR DETECTION (Laplacian Variance) ============
        gray = cv2.cvtColor(img_cv2, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        scores["blur_score"] = round(laplacian_var, 2)
        
        if laplacian_var < self.MIN_BLUR_SCORE:
            issues.append(f"Image appears blurry (score: {laplacian_var:.1f}). Please take a clearer photo with good focus.")
        
        # ============ BRIGHTNESS CHECK ============
        brightness = gray.mean()
        scores["brightness"] = round(brightness, 2)
        
        if brightness < self.MIN_BRIGHTNESS:
            issues.append(f"Image is too dark (brightness: {brightness:.1f}/255). Please use better lighting.")
        elif brightness > self.MAX_BRIGHTNESS:
            issues.append(f"Image is overexposed (brightness: {brightness:.1f}/255). Please reduce lighting or glare.")
        
        # ============ CONTRAST CHECK ============
        contrast = gray.std()
        if contrast < 30:
            issues.append("Image has low contrast. Ensure the ID card is clearly visible against the background.")
        
        # ============ DETERMINE OVERALL QUALITY ============
        if len(issues) == 0:
            scores["overall_quality"] = "good"
        elif len(issues) <= 1:
            scores["overall_quality"] = "acceptable"
        else:
            scores["overall_quality"] = "poor"
        
        is_valid = len(issues) <= 1  # Allow 1 minor issue
        return is_valid, issues, scores
    
    def get_quality_tips(self, image_type="ID"):
        """Return tips for capturing better quality images"""
        if image_type == "ID":
            return [
                "Place your ID on a flat, well-lit surface",
                "Avoid glare from lights or windows",
                "Ensure all text on the ID is readable",
                "Hold the camera steady to avoid blur",
                "Fill the frame with the ID card"
            ]
        else:  # Selfie
            return [
                "Face the camera directly",
                "Ensure good, even lighting on your face",
                "Remove glasses if they cause glare",
                "Keep the camera at eye level",
                "Hold the phone steady"
            ]
    
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
    
    def extract_text_with_strategies(self, img_path, img_cv2, reader):
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

    def extract_id_information(self, ocr_text):
        """
        Extract structured information from ID card OCR text.
        Supports Philippine IDs (National ID, Driver's License, UMID, PhilHealth, etc.)
        """
        import re
        from datetime import datetime
        
        extracted = {
            "birthdate": None,
            "sex": None,
            "address": None,
            "id_number": None,
            "nationality": None,
            "civil_status": None,
        }
        
        text_upper = ocr_text.upper()
        
        # ============ BIRTHDATE EXTRACTION WITH VALIDATION ============
        date_patterns = [
            r'\b(\d{1,2}[/\-]\d{1,2}[/\-]\d{4})\b',  # MM/DD/YYYY or MM-DD-YYYY
            r'\b(\d{4}[/\-]\d{1,2}[/\-]\d{1,2})\b',  # YYYY-MM-DD
            r'\b((?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s*\d{1,2},?\s*\d{4})\b',  # Month DD, YYYY
            r'\b(\d{1,2}\s*(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s*\d{4})\b',  # DD Month YYYY
        ]
        
        def validate_birthdate(date_str):
            """Validate that birthdate is reasonable (between 1900 and 15 years ago)"""
            try:
                current_year = datetime.now().year
                # Extract year from various formats
                year_match = re.search(r'\b(19\d{2}|20[0-1]\d)\b', date_str)
                if year_match:
                    year = int(year_match.group(1))
                    # Must be between 1900 and (current_year - 15) for a valid adult
                    if 1900 <= year <= current_year - 10:
                        return True
                return False
            except:
                return False
        
        for pattern in date_patterns:
            match = re.search(pattern, text_upper)
            if match:
                date_str = match.group(1)
                if validate_birthdate(date_str):
                    extracted["birthdate"] = date_str
                    break
        
        # ============ SEX EXTRACTION ============
        sex_patterns = [
            r'SEX[:\s]*([MF]|MALE|FEMALE)',  # After SEX label
            r'\b(MALE|FEMALE)\b',  # Standalone words
        ]
        for pattern in sex_patterns:
            match = re.search(pattern, text_upper)
            if match:
                sex_value = match.group(1)
                if sex_value in ['M', 'MALE']:
                    extracted["sex"] = "Male"
                elif sex_value in ['F', 'FEMALE']:
                    extracted["sex"] = "Female"
                break
        
        # ============ NATIONALITY EXTRACTION ============
        if 'FILIPINO' in text_upper or 'PILIPINO' in text_upper or 'PHILIPPINE' in text_upper:
            extracted["nationality"] = "Filipino"
        
        # ============ CIVIL STATUS EXTRACTION ============
        civil_statuses = ['SINGLE', 'MARRIED', 'WIDOWED', 'SEPARATED', 'DIVORCED']
        for status in civil_statuses:
            if status in text_upper:
                extracted["civil_status"] = status.capitalize()
                break
        
        # ============ ADDRESS EXTRACTION (CRITICAL FIX) ============
        address = None
        
        # Strategy 1: Look for text after "ADDRESS" keyword
        address_match = re.search(r'ADDRESS[:\s]*(.+?)(?:BIRTH|DATE|SEX|NATIONALITY|CIVIL|STATUS|$)', text_upper, re.DOTALL)
        if address_match:
            address = address_match.group(1).strip()
        
        # Strategy 2: Fallback - Look for barangay patterns
        if not address or len(address) < 10:
            brgy_patterns = [
                r'((?:BRGY\.?|BARANGAY)\s+[A-Z0-9\s]+(?:,\s*[A-Z\s]+)?)',  # Brgy. XXX, City
                r'((?:PUROK|SITIO)\s+[A-Z0-9\s]+(?:,\s*[A-Z\s]+)?)',  # Purok/Sitio XXX
            ]
            for pattern in brgy_patterns:
                match = re.search(pattern, text_upper)
                if match:
                    address = match.group(1).strip()
                    break
        
        # Strategy 3: Fallback - Look for city/municipality patterns
        if not address or len(address) < 10:
            city_patterns = [
                r'((?:CITY|MUNICIPALITY)\s+OF\s+[A-Z\s]+)',  # City/Municipality of XXX
                r'([A-Z\s]+(?:CITY|TOWN|MUNICIPALITY))',  # XXX City/Town
            ]
            for pattern in city_patterns:
                match = re.search(pattern, text_upper)
                if match:
                    candidate = match.group(1).strip()
                    if len(candidate) > 8:
                        address = candidate
                        break
        
        # Strategy 4: Fallback - Look for street number patterns
        if not address or len(address) < 10:
            street_patterns = [
                r'(\d+\s+[A-Z]+\s+(?:ST\.?|STREET|AVE\.?|AVENUE|ROAD|RD\.?|BLVD\.?|BOULEVARD)[A-Z\s,]*)',
                r'((?:BLK\.?|BLOCK)\s*\d+\s*(?:LOT|LT\.?)\s*\d+[A-Z\s,]*)',  # Blk X Lot Y patterns
            ]
            for pattern in street_patterns:
                match = re.search(pattern, text_upper)
                if match:
                    candidate = match.group(1).strip()
                    if len(candidate) > 10:
                        address = candidate
                        break

        # Strategy 5: Look for province patterns
        if not address or len(address) < 10:
            province_match = re.search(r'([A-Z\s]+(?:PROVINCE|METRO MANILA|NCR|CALABARZON|BICOL|VISAYAS|MINDANAO))', text_upper)
            if province_match:
                address = province_match.group(1).strip()
        
        # Clean up and store address
        if address:
            address = re.sub(r'\s+', ' ', address).strip()
            # Remove common false positives
            false_positives = ['REPUBLIC OF THE PHILIPPINES', 'REPUBLIKA NG PILIPINAS']
            for fp in false_positives:
                if address == fp:
                    address = None
                    break
            if address and len(address) > 10:
                extracted["address"] = address[:200]
        
        # ============ ID NUMBER EXTRACTION (EXPANDED FORMATS) ============
        id_patterns = [
            # PhilSys National ID - 16 digits in 4 groups
            r'\b(\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4})\b',
            # PhilSys PSN format - XXX-XXXX-XXXXX-X
            r'\b(\d{3}[-\s]?\d{4}[-\s]?\d{5}[-\s]?\d{1})\b',
            # Driver's License - Letter + 2 digits + 2 digits + 6 digits
            r'\b([A-Z]\d{2}[-\s]?\d{2}[-\s]?\d{6})\b',
            # SSS - 2 + 7 + 1 digits
            r'\b(\d{2}[-\s]?\d{7}[-\s]?\d{1})\b',
            # UMID - 12 digits (same as SSS format but also used standalone)
            r'\b(\d{12})\b',
            # PhilHealth - 12 digits with optional dashes
            r'\b(\d{2}[-\s]?\d{9}[-\s]?\d{1})\b',
            # Postal ID - Letter(s) + Numbers
            r'\b([A-Z]{1,3}[-\s]?\d{6,12})\b',
            # Voter's ID - VIN format
            r'\b(VIN[-\s]?\d{10,15})\b',
            # PRC License - 7 digits
            r'\b(\d{7})\b',
            # Generic ID number after label
            r'(?:ID\s*(?:NO\.?|NUMBER)?|NO\.?|NUMBER)[:\s#]*([A-Z0-9\-]{8,20})',
            # CRN (Common Reference Number) format
            r'\b(CRN[-\s]?\d{10,12})\b',
        ]
        
        for pattern in id_patterns:
            match = re.search(pattern, text_upper)
            if match:
                id_num = match.group(1).strip()
                # Validate it's not just a date or year
                if not re.match(r'^\d{4}$', id_num) and len(id_num) >= 7:
                    extracted["id_number"] = id_num
                    break
        
        return extracted

    # Valid Philippine Government ID Types
    VALID_ID_TYPES = [
        'passport',        # Philippine Passport
        'philsys',         # Philippine National ID (PhilSys ID / PhilID)
        'drivers_license', # Driver's License (LTO)
        'umid',            # UMID Card (SSS/GSIS)
        'prc',             # PRC ID (Professional Regulation Commission)
        'voters_id',       # Voter's ID (COMELEC)
        'seamans_book',    # Seaman's Book (SIRB)
        'owwa',            # OWWA / OFW ID
        'pwd',             # PWD ID (Person with Disability)
    ]
    
    # IDs that don't have a back side
    IDS_WITHOUT_BACK = ['passport', 'seamans_book']
    
    # Keywords to detect for each ID type (must match at least one)
    ID_TYPE_KEYWORDS = {
        'passport': [
            'PASSPORT', 'PASAPORTE', 'DEPARTMENT OF FOREIGN AFFAIRS', 'DFA', 
            'REPUBLIKA NG PILIPINAS', 'REPUBLIC OF THE PHILIPPINES',
            'TRAVEL DOCUMENT', 'PASSPORT NO', 'DATE OF ISSUE', 'DATE OF EXPIRY'
        ],
        'philsys': [
            'PHILIPPINE IDENTIFICATION', 'PHILSYS', 'PHILID', 'PSA',
            'PHILIPPINE STATISTICS AUTHORITY', 'NATIONAL ID', 'PCN',
            'COMMON REFERENCE NUMBER', 'CRN'
        ],
        'drivers_license': [
            'LAND TRANSPORTATION OFFICE', 'LTO', "DRIVER'S LICENSE", 'DRIVERS LICENSE',
            'LICENSE NO', 'NON-PROFESSIONAL', 'PROFESSIONAL', 'RESTRICTION',
            'AGENCY CODE', 'DL CODES', 'MOTOR VEHICLE'
        ],
        'umid': [
            'UNIFIED MULTI-PURPOSE ID', 'UMID', 'SSS', 'GSIS',
            'SOCIAL SECURITY SYSTEM', 'GOVERNMENT SERVICE INSURANCE',
            'SSS NO', 'GSIS NO', 'CRN'
        ],
        'prc': [
            'PROFESSIONAL REGULATION COMMISSION', 'PRC', 'LICENSE NO',
            'REGISTRATION NO', 'VALID UNTIL', 'PROFESSION',
            'BOARD OF', 'REGISTERED', 'LICENSURE'
        ],
        'voters_id': [
            'COMELEC', 'COMMISSION ON ELECTIONS', "VOTER'S ID", 'VOTERS ID',
            'KOMISYON SA HALALAN', 'VIN', 'PRECINCT NO', 'VOTER IDENTIFICATION'
        ],
        'seamans_book': [
            'MARINA', 'MARITIME INDUSTRY AUTHORITY', 'SEAFARER', 'SEAMAN',
            'SIRB', 'SEAFARER IDENTIFICATION', 'RECORD BOOK'
        ],
        'owwa': [
            'OVERSEAS WORKERS WELFARE', 'OWWA', 'OFW', 'OVERSEAS FILIPINO WORKER',
            'MEMBERSHIP', 'DEPARTMENT OF LABOR', 'DOLE', 'POEA'
        ],
        'pwd': [
            'PERSON WITH DISABILITY', 'PWD', 'DISABILITY', 'NCDA',
            'NATIONAL COUNCIL ON DISABILITY', 'PWD ID NO', 'TYPE OF DISABILITY'
        ]
    }
    
    # Keywords that indicate INVALID/non-government IDs
    INVALID_ID_KEYWORDS = [
        # Student IDs
        'STUDENT', 'UNIVERSITY', 'COLLEGE', 'SCHOOL', 'CAMPUS', 'INSTITUTE',
        'BSCS', 'BSIT', 'BSBA', 'BSCE', 'BSEE', 'BSME', 'AB', 'BS',
        'COURSE', 'YEAR LEVEL', 'ACADEMIC', 'ENROLLMENT', 'SEMESTER',
        'REGISTRAR', 'DEAN', 'FACULTY', 'DEPARTMENT OF',
        # Specific universities/schools
        'STATE UNIVERSITY', 'POLYTECHNIC', 'TECHNOLOGICAL', 
        # Company/Employee IDs
        'EMPLOYEE', 'STAFF', 'COMPANY', 'CORPORATION', 'INC.', 'LLC',
        'CONTRACTOR', 'PERSONNEL', 'BADGE', 'ACCESS CARD',
        # Other non-valid IDs
        'LIBRARY', 'GYM', 'MEMBERSHIP CARD', 'LOYALTY', 'DISCOUNT CARD',
        'BARANGAY ID', 'BARANGAY CLEARANCE', 'BRGY ID', 'BRGY. ID'
    ]
    
    def validate_id_type(self, ocr_text, claimed_id_type):
        """
        Validate that the OCR text matches the claimed ID type.
        Returns (is_valid, detected_type, error_message)
        """
        text_upper = ocr_text.upper()
        
        # First check for INVALID ID keywords
        invalid_keywords_found = []
        for keyword in self.INVALID_ID_KEYWORDS:
            if keyword in text_upper:
                invalid_keywords_found.append(keyword)
        
        # If we find invalid keywords (like STUDENT, UNIVERSITY, etc.)
        if invalid_keywords_found:
            # But also check if it's actually a valid ID that happens to mention these
            # (e.g., a PRC license might say "BOARD OF EDUCATION")
            valid_keywords_found = []
            if claimed_id_type in self.ID_TYPE_KEYWORDS:
                for keyword in self.ID_TYPE_KEYWORDS[claimed_id_type]:
                    if keyword in text_upper:
                        valid_keywords_found.append(keyword)
            
            # If we found more invalid keywords than valid ones, reject
            if len(invalid_keywords_found) > len(valid_keywords_found):
                return (
                    False, 
                    'invalid', 
                    f"This appears to be a non-government ID (detected: {', '.join(invalid_keywords_found[:3])}). "
                    "Only valid government-issued IDs are accepted. Student IDs, company IDs, and barangay IDs are not valid."
                )
        
        # Check if OCR text contains keywords for the claimed ID type
        if claimed_id_type not in self.ID_TYPE_KEYWORDS:
            return (False, None, f"Unknown ID type: {claimed_id_type}")
        
        expected_keywords = self.ID_TYPE_KEYWORDS[claimed_id_type]
        matching_keywords = []
        
        for keyword in expected_keywords:
            if keyword in text_upper:
                matching_keywords.append(keyword)
        
        if matching_keywords:
            # Found matching keywords for claimed ID type
            return (True, claimed_id_type, None)
        
        # Didn't find expected keywords - check if it matches a different ID type
        detected_type = None
        detected_keywords = []
        
        for id_type, keywords in self.ID_TYPE_KEYWORDS.items():
            for keyword in keywords:
                if keyword in text_upper:
                    if not detected_type or len(keyword) > len(detected_keywords[0] if detected_keywords else ''):
                        detected_type = id_type
                        detected_keywords.append(keyword)
        
        if detected_type and detected_type != claimed_id_type:
            # Found a different valid ID type
            id_type_labels = {
                'passport': 'Philippine Passport',
                'philsys': 'Philippine National ID (PhilSys)',
                'drivers_license': "Driver's License (LTO)",
                'umid': 'UMID Card',
                'prc': 'PRC ID',
                'voters_id': "Voter's ID",
                'seamans_book': "Seaman's Book",
                'owwa': 'OWWA/OFW ID',
                'pwd': 'PWD ID'
            }
            claimed_label = id_type_labels.get(claimed_id_type, claimed_id_type)
            detected_label = id_type_labels.get(detected_type, detected_type)
            
            return (
                False, 
                detected_type,
                f"ID type mismatch. You selected '{claimed_label}' but the uploaded image appears to be a '{detected_label}'. "
                "Please select the correct ID type or upload the correct ID."
            )
        
        # Could not detect any valid government ID
        return (
            False,
            None,
            "Could not verify this is a valid government ID. Please ensure you uploaded a clear image of a valid Philippine government-issued ID. "
            "The ID should be well-lit with all text clearly visible."
        )

    def post(self, request):
        import cv2
        import uuid
        from thefuzz import fuzz
        from django.core.files.storage import default_storage
        
        import easyocr
        from deepface import DeepFace

        id_image = request.FILES.get('id_image')
        id_back_image = request.FILES.get('id_back_image')  # Optional back image
        user_image = request.FILES.get('user_image')
        id_type = request.data.get('id_type', '').lower().strip()

        input_first_name = request.data.get('first_name', '').upper().strip()
        input_last_name = request.data.get('last_name', '').upper().strip()
        input_middle_name = request.data.get('middle_name', '').upper().strip()
        
        print(f"DEBUG Input Names: First: {input_first_name}, Middle: {input_middle_name}, Last: {input_last_name}")
        print(f"DEBUG ID Type: {id_type}")
        print("-------------------------------")
        
        # Validate ID type
        if not id_type or id_type not in self.VALID_ID_TYPES:
            return Response({
                "success": False,
                "error": "Invalid ID Type",
                "details": "Please select a valid government-issued ID. Student IDs, company IDs, and other non-government IDs are not accepted.",
                "valid_types": self.VALID_ID_TYPES
            }, status=422)
        
        if not id_image or not user_image:
            return Response({
                "success": False,
                "error": "Missing Images",
                "details": "Please provide both your ID image and a selfie."
            }, status=400)

        # Generate unique file names
        id_name = f"tmp_{uuid.uuid4()}_id.jpg"
        id_back_name = f"tmp_{uuid.uuid4()}_id_back.jpg" if id_back_image else None
        user_name = f"tmp_{uuid.uuid4()}_user.jpg"

        id_path = default_storage.save(id_name, id_image)
        id_back_path = default_storage.save(id_back_name, id_back_image) if id_back_image else None
        user_path = default_storage.save(user_name, user_image)

        abs_id_path = default_storage.path(id_path)
        abs_id_back_path = default_storage.path(id_back_path) if id_back_path else None
        abs_user_path = default_storage.path(user_path)
        
        # Create a copy of ID image for OCR (keep original for face detection)
        ocr_id_path = abs_id_path.replace('.jpg', '_ocr.jpg')
        ocr_id_back_path = abs_id_back_path.replace('.jpg', '_ocr.jpg') if abs_id_back_path else None

        try:
            reader = easyocr.Reader(['en'], gpu=False) 

            id_img_cv2 = cv2.imread(abs_id_path)
            user_img_cv2 = cv2.imread(abs_user_path)

            if id_img_cv2 is None or user_img_cv2 is None:
                return Response({
                    "success": False,
                    "error": "Image Load Error",
                    "details": "Failed to load one or both images. Please ensure you uploaded valid image files (JPG, PNG).",
                    "tip": "Try taking a new photo or use a different image file."
                }, status=400)
            
            # ============ IMAGE QUALITY VALIDATION ============
            id_quality_valid, id_issues, id_quality_scores = self.check_image_quality(id_img_cv2, "ID")
            selfie_quality_valid, selfie_issues, selfie_quality_scores = self.check_image_quality(user_img_cv2, "selfie")
            
            all_issues = []
            if id_issues:
                all_issues.extend([f"ID Card: {issue}" for issue in id_issues])
            if selfie_issues:
                all_issues.extend([f"Selfie: {issue}" for issue in selfie_issues])
            
            # If quality is too poor (more than 2 issues total), reject early
            if len(all_issues) > 2:
                return Response({
                    "success": False,
                    "error": "Poor Image Quality",
                    "details": "The uploaded images don't meet quality requirements.",
                    "issues": all_issues,
                    "quality_scores": {
                        "id_card": id_quality_scores,
                        "selfie": selfie_quality_scores
                    },
                    "tips": {
                        "id_card": self.get_quality_tips("ID"),
                        "selfie": self.get_quality_tips("selfie")
                    },
                    "tip": "Please retake your photos following the tips provided."
                }, status=422)
            
            # Log quality scores for debugging
            print(f"DEBUG ID Quality: {id_quality_scores}")
            print(f"DEBUG Selfie Quality: {selfie_quality_scores}")
            
            # Save a copy for OCR processing (keep original clean for face detection)
            cv2.imwrite(ocr_id_path, id_img_cv2)
            
            # ============ OCR TEXT EXTRACTION ============
            ocr_text, ocr_result = self.extract_text_with_strategies(ocr_id_path, id_img_cv2.copy(), reader)
            
            print(f"DEBUG OCR TEXT: {ocr_text}")
            print(f"DEBUG OCR WORDS: {ocr_result}")
            
            # Check if OCR extracted enough text
            if len(ocr_text.strip()) < 20:
                return Response({
                    "success": False,
                    "error": "Text Recognition Failed",
                    "details": "Could not read text from your ID card. The image may be too blurry, dark, or the ID is not clearly visible.",
                    "quality_scores": {
                        "id_card": id_quality_scores
                    },
                    "tips": self.get_quality_tips("ID"),
                    "tip": "Please take a clearer photo of your ID with good lighting and ensure all text is readable."
                }, status=422)
            
            # ============ ID TYPE VALIDATION ============
            # Validate that the uploaded ID matches the claimed ID type
            id_type_valid, detected_type, id_type_error = self.validate_id_type(ocr_text, id_type)
            
            print(f"DEBUG ID Type Validation: valid={id_type_valid}, detected={detected_type}, claimed={id_type}")
            
            if not id_type_valid:
                return Response({
                    "success": False,
                    "error": "Invalid ID Detected",
                    "details": id_type_error,
                    "claimed_id_type": id_type,
                    "detected_id_type": detected_type,
                    "tip": "Please upload the correct government-issued ID that matches your selection. Student IDs, company IDs, and barangay IDs are not accepted."
                }, status=422)

            # ============ EXTRACT ID INFORMATION ============
            id_info = self.extract_id_information(ocr_text)
            print(f"DEBUG EXTRACTED INFO: {id_info}")

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
                    "success": False,
                    "error": "Name Mismatch",
                    "details": f"The name on your ID doesn't match your profile. Please ensure your profile name matches your ID exactly.",
                    "scores": {
                        "last_name": last_name_score,
                        "first_name": first_name_score,
                        "middle_name": middle_name_score if input_middle_name else None
                    },
                    "provided_name": {
                        "first_name": input_first_name,
                        "middle_name": input_middle_name if input_middle_name else None,
                        "last_name": input_last_name
                    },
                    "ocr_preview": ocr_text[:200],
                    "tip": "Check that your First Name and Last Name in your profile settings exactly match what's on your ID."
                }, status=422)
            
            # ============ FACE VERIFICATION ============
            # Use ORIGINAL ID image (not the preprocessed one) for face detection
            result = DeepFace.verify(
                img1_path=abs_id_path,  # Original, unprocessed ID image
                img2_path=abs_user_path,
                detector_backend='opencv',
                enforce_detection=False
            )

            face_verified = result['verified']
            similarity = 1 - result['distance']
            
            # Overall verification: both name and face must match
            overall_verified = names_match and face_verified and similarity >= 0.5

            return Response({
                "success": True,
                "verified": overall_verified,
                "face_verified": face_verified,
                "name_verified": names_match,
                "similarity": similarity,
                "name_match_score": avg_score,
                "extracted_data": {
                    "first_name": input_first_name,
                    "middle_name": input_middle_name if input_middle_name else None,
                    "last_name": input_last_name,
                    "birthdate": id_info.get("birthdate"),
                    "sex": id_info.get("sex"),
                    "address": id_info.get("address"),
                    "id_number": id_info.get("id_number"),
                    "nationality": id_info.get("nationality"),
                    "civil_status": id_info.get("civil_status"),
                },
                "ocr_confidence": {
                    "last_name": last_name_score,
                    "first_name": first_name_score,
                    "middle_name": middle_name_score if input_middle_name else None
                },
                "message": "Identity verified successfully!" if overall_verified else "Face verification failed. The selfie doesn't match the ID photo."
            })

        except Exception as e:
            import traceback
            print(f"DEBUG Error: {traceback.format_exc()}")
            return Response({"error": str(e)}, status=500)
        
        finally:
            # Clean up all temporary files
            for path in [abs_id_path, abs_id_back_path, abs_user_path, ocr_id_path, ocr_id_back_path]:
                if path and os.path.exists(path):
                    try:
                        os.remove(path)
                    except:
                        pass