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


# Case types beyond barangay jurisdiction (Katarungang Pambarangay Law - RA 7160)
# These cases must be referred to proper authorities (police, prosecutor, courts)
EXCLUDED_CASE_TYPES = [
    # Crimes against persons - serious bodily harm or death
    "murder",
    "homicide",
    "parricide",
    "infanticide",
    "manslaughter",
    "rape",
    "sexual assault",
    "acts of lasciviousness",  # when involving minors
    "attempted murder",
    "frustrated murder",
    "serious physical injuries",
    
    # Crimes against liberty
    "kidnapping",
    "serious illegal detention",
    "human trafficking",
    "trafficking in persons",
    "forced labor",
    "child trafficking",
    "slavery",
    
    # Crimes against property - with violence
    "robbery",
    "robbery with violence",
    "robbery with homicide",
    "carnapping",
    "highway robbery",
    "brigandage",
    "arson",
    
    # Drug-related offenses (RA 9165)
    "drug trafficking",
    "drug possession",
    "illegal drugs",
    "drug pushing",
    "drug manufacturing",
    "drug importation",
    
    # Crimes against public order
    "rebellion",
    "sedition",
    "terrorism",
    "coup d'etat",
    
    # Crimes against chastity
    "qualified seduction",
    "child abuse",
    "child exploitation",
    "pedophilia",
    
    # Other serious crimes
    "estafa",  # when amount exceeds barangay jurisdiction threshold
    "qualified theft",
    "falsification",
    "illegal possession of firearms",
    "illegal discharge of firearms",
    "violation of anti-violence against women and children act",
    "vawc",
    "domestic violence",  # when serious, falls under VAWC
    "cybercrime",
    "identity theft",
    "money laundering",
    "corruption",
    "graft",
    "bribery",
    "election offenses",
    
    # Additional serious offenses
    "attempted rape",
    "frustrated homicide",
    "serious threats with weapon",
    "grave coercion",
]


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
        
        # Check if case type is beyond barangay jurisdiction
        case_type_lower = case_type.lower().strip()
        for excluded in EXCLUDED_CASE_TYPES:
            if excluded in case_type_lower or case_type_lower in excluded:
                print(f"[AI Predict] REJECTED: Case type '{case_type}' is beyond barangay jurisdiction")
                return Response(
                    {
                        "success": False,
                        "error": f"This case type '{case_type}' is beyond barangay jurisdiction and cannot be handled through the Katarungang Pambarangay system.",
                        "beyond_jurisdiction": True,
                        "recommendation": "Please refer this case to the proper authorities (Police, Prosecutor's Office, or Courts)."
                    },
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
    API endpoint to trigger model retraining (manual).
    
    POST /api/trigger-retrain/
    
    Request Body (optional):
    {
        "force": true  // Force retrain even if threshold not met
    }
    
    Response:
    {
        "success": true,
        "message": "Successfully fine-tuned on 42 cases",
        "samples_trained": 42,
        "triggered": true,
        "metrics": {...}
    }
    """
    
    def post(self, request):
        from .retrain_model import check_and_trigger_retrain
        
        data = request.data
        force = data.get("force", True)  # Manual trigger usually forces
        
        print(f"[TriggerRetrain] Manual retrain triggered (force={force})")
        
        try:
            result = check_and_trigger_retrain(
                force=force,
                triggered_by='manual',
                user=request.user if request.user.is_authenticated else None
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


class TrainingStatusView(APIView):
    """
    API endpoint to get current training status and configuration.
    
    GET /api/training-status/
    
    Response:
    {
        "auto_retrain_enabled": true,
        "threshold_cases": 10,
        "cases_since_last_train": 3,
        "total_resolved_cases": 42,
        "ready_to_retrain": true,
        "threshold_reached": false,
        "last_training": {...}
    }
    """
    
    def get(self, request):
        from .retrain_model import get_training_status
        
        try:
            status_data = get_training_status()
            return Response(status_data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"[TrainingStatus] Error: {e}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UpdateRetrainConfigView(APIView):
    """
    API endpoint to update retraining configuration.
    
    POST /api/retrain-config/
    {
        "auto_retrain_enabled": true,
        "threshold_cases": 15
    }
    """
    
    def post(self, request):
        from .models import RetrainConfig
        
        data = request.data
        config = RetrainConfig.get_config()
        
        if "auto_retrain_enabled" in data:
            config.auto_retrain_enabled = data["auto_retrain_enabled"]
        if "threshold_cases" in data:
            config.threshold_cases = max(1, int(data["threshold_cases"]))
        if "default_epochs" in data:
            config.default_epochs = max(10, int(data["default_epochs"]))
        
        config.save()
        
        return Response({
            "success": True,
            "config": {
                "auto_retrain_enabled": config.auto_retrain_enabled,
                "threshold_cases": config.threshold_cases,
                "default_epochs": config.default_epochs
            }
        }, status=status.HTTP_200_OK)


class SettlementPredictionView(APIView):
    """
    API endpoint to get the most likely settlement type for a case.
    
    POST /api/predict-settlement/
    
    Request Body:
    {
        "case_type": "Grave Threats",
        "severity": 2,
        "relationship": "Neighbor",
        "num_complainants": 1,
        "num_respondents": 1
    }
    
    Response:
    {
        "success": true,
        "likely_settlement": "Amicable Settlement",
        "predicted_hearings": 2,
        "predicted_days": 14,
        "confidence_reason": "Lowest predicted hearings among all settlement types",
        "all_predictions": {...}
    }
    """
    
    def post(self, request):
        data = request.data
        
        # Required fields
        case_type = data.get("case_type")
        severity = data.get("severity")
        relationship = data.get("relationship", "Neighbor")
        num_complainants = data.get("num_complainants", 1)
        num_respondents = data.get("num_respondents", 1)
        lockdown_status = data.get("lockdown_status", "Normal")
        
        # Validate
        if not case_type or severity is None:
            return Response(
                {"success": False, "error": "case_type and severity are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get predictions for all settlement types
        result = predict_case_outcomes(
            case_type=case_type,
            severity=severity,
            relationship=relationship,
            num_complainants=num_complainants,
            num_respondents=num_respondents,
            lockdown_status=lockdown_status
        )
        
        if not result.get("success"):
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        predictions = result.get("predictions", {})
        
        if not predictions:
            return Response(
                {"success": False, "error": "No predictions available"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Find the settlement type with the lowest predicted hearings
        # (fewer hearings = faster resolution = more likely)
        best_settlement = min(
            predictions.items(),
            key=lambda x: x[1].get("predicted_hearings", float('inf'))
        )
        
        settlement_name = best_settlement[0]
        settlement_data = best_settlement[1]
        
        return Response({
            "success": True,
            "likely_settlement": settlement_name,
            "predicted_hearings": settlement_data.get("predicted_hearings"),
            "predicted_days": settlement_data.get("predicted_days"),
            "predicted_weeks": settlement_data.get("predicted_weeks"),
            "confidence_reason": "Lowest predicted hearings among all settlement types",
            "all_predictions": predictions,
            "input_summary": result.get("input_summary", {})
        }, status=status.HTTP_200_OK)


