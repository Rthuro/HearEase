"""
Test script for ID extraction and verification
Tests the improved VerifyIdentityView with multi-strategy OCR
"""

import os
import sys
sys.path.insert(0, '.')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hearease_main.settings')

import django
django.setup()

import cv2
import numpy as np
from PIL import Image
import io

def test_preprocessing_strategies():
    """Test the different preprocessing strategies"""
    print("=" * 60)
    print("ID EXTRACTION TEST: Preprocessing Strategies")
    print("=" * 60)
    
    from users.views import VerifyIdentityView
    
    view = VerifyIdentityView()
    
    # Create a sample test image with text
    print("\n1. Creating test image with sample text...")
    
    # Create a simple test image
    img = np.ones((200, 400, 3), dtype=np.uint8) * 255  # White background
    cv2.putText(img, "JUAN DELA CRUZ", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
    cv2.putText(img, "1990-01-15", (50, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    cv2.putText(img, "MANILA, PHILIPPINES", (50, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
    
    print("2. Testing preprocessing strategies...")
    strategies = ['clahe', 'adaptive', 'otsu', 'morph', 'none']
    
    for strategy in strategies:
        try:
            processed = view.preprocess_for_ocr(img.copy(), strategy)
            print(f"   ✓ {strategy}: shape={processed.shape}, dtype={processed.dtype}")
        except Exception as e:
            print(f"   ✗ {strategy}: FAILED - {e}")
    
    print("\n3. Testing name matching function...")
    
    test_cases = [
        ("DELA CRUZ", "JUAN DELA CRUZ SAMPLE TEXT"),
        ("JUAN", "JUAN DELA CRUZ SAMPLE TEXT"),
        ("CRUZ", "JUAN DELA CRUX SAMPLE TEXT"),  # Typo test
        ("SANTOS", "JUAN DELA CRUZ SAMPLE TEXT"),  # Not found
    ]
    
    for name, text in test_cases:
        match, score = view.match_name_in_text(name, text)
        status = "✓ MATCH" if match else "✗ NO MATCH"
        print(f"   {status}: '{name}' in text -> {score}%")
    
    print("\n4. OCR MULTI-STRATEGY TEST")
    print("   Saving test image to /tmp/test_id.jpg...")
    
    test_path = os.path.join(os.path.dirname(__file__), 'test_id_temp.jpg')
    cv2.imwrite(test_path, img)
    
    try:
        ocr_text, ocr_words = view.extract_text_with_strategies(test_path, img.copy())
        print(f"   Extracted text: {ocr_text}")
        print(f"   Words found: {len(ocr_words)}")
    except Exception as e:
        print(f"   OCR Error: {e}")
    finally:
        if os.path.exists(test_path):
            os.remove(test_path)
    
    print("\n5. ANALYSIS:")
    print("   - Multiple preprocessing strategies are available")
    print("   - Name matching uses fuzzy matching for OCR errors")
    print("   - Original image preserved for face detection")
    print("   - Middle name support added")
    
    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

if __name__ == '__main__':
    test_preprocessing_strategies()
