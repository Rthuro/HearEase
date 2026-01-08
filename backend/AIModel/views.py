"""
AI Model Views for HearEase
REST API endpoints for AI predictions.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .predictor import (
    predict_case_outcomes,
    get_model_info,
    get_trained_case_types,
    get_settlement_types,
    get_relationship_types
)


class PredictCaseView(APIView):
    """
    API endpoint for predicting case outcomes.
    
    POST /api/predict-case/
    
    Request Body:
    {
        "case_type": "Grave Threats",
        "severity": 2,
        "relationship": "Neighbor",
        "num_complainants": 1,
        "num_respondents": 1,
        "lockdown_status": "Normal"  // Optional, defaults to "Normal"
    }
    
    Response:
    {
        "success": true,
        "predictions": {
            "Amicable Settlement": {
                "predicted_hearings": 3,
                "predicted_days": 21,
                "predicted_weeks": 3.0
            },
            ...
        },
        "input_summary": {...}
    }
    """
    
    def post(self, request):
        data = request.data
        
        # Debug logging
        print(f"[AI Predict] Received data: {data}")
        
        # Required fields
        case_type = data.get("case_type")
        severity = data.get("severity")
        relationship = data.get("relationship", "Neighbor")
        num_complainants = data.get("num_complainants", 1)
        num_respondents = data.get("num_respondents", 1)
        
        # Optional field with default
        lockdown_status = data.get("lockdown_status", "Normal")
        
        print(f"[AI Predict] Parsed: case_type={case_type}, severity={severity}")
        
        # Validate required fields
        if not case_type:
            print("[AI Predict] ERROR: case_type is missing")
            return Response(
                {"success": False, "error": "case_type is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if severity is None:
            print("[AI Predict] ERROR: severity is missing")
            return Response(
                {"success": False, "error": "severity is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Make prediction
        result = predict_case_outcomes(
            case_type=case_type,
            severity=severity,
            relationship=relationship,
            num_complainants=num_complainants,
            num_respondents=num_respondents,
            lockdown_status=lockdown_status
        )
        
        if result.get("success"):
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ModelInfoView(APIView):
    """
    API endpoint to get model information.
    
    GET /api/model-info/
    
    Response:
    {
        "success": true,
        "model_loaded": true,
        "trained_case_types": [...],
        "settlement_types": [...],
        "relationship_types": [...]
    }
    """
    
    def get(self, request):
        result = get_model_info()
        
        if result.get("success"):
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class TriggerRetrainView(APIView):
    """
    API endpoint to trigger model retraining.
    
    POST /api/trigger-retrain/
    
    Request Body (optional):
    {
        "epochs": 50,  // Optional, default 50
        "validation_split": 0.2  // Optional, default 0.2
    }
    
    Response:
    {
        "success": true,
        "message": "Successfully fine-tuned on 42 cases",
        "samples_trained": 42,
        "metrics": {
            "final_loss": 0.0123,
            "val_loss": 0.0145,
            "epochs_trained": 35,
            "backup_location": "/path/to/backup"
        }
    }
    """
    
    def post(self, request):
        from .retrain_model import fine_tune_model
        
        data = request.data
        epochs = data.get("epochs", 50)
        validation_split = data.get("validation_split", 0.2)
        
        print(f"[TriggerRetrain] Starting retrain with epochs={epochs}, validation_split={validation_split}")
        
        try:
            result = fine_tune_model(
                epochs=epochs,
                validation_split=validation_split
            )
            
            if result.get("success"):
                return Response(result, status=status.HTTP_200_OK)
            else:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"[TriggerRetrain] Error: {e}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

