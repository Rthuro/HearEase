"""
AI Model Predictor Module for HearEase
Handles loading the trained model and making predictions for case outcomes.
"""

import os
import warnings
import numpy as np
import pandas as pd
import joblib

# Suppress warnings for cleaner output
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')

import tensorflow as tf
tf.get_logger().setLevel('ERROR')

# from tensorflow.keras.models import load_model
from keras.models import load_model

# Get the directory where this module is located
MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(MODULE_DIR, "models")

# Feature column mappings
FEATURE_COLS = {
    "Case_Type": "Case_Type",
    "Settlement_Type": "Settlement_Type",
    "Severity": "Severity",
    "Num_Complainants": "Num_Complainants",
    "Num_Respondents": "Num_Respondents",
    "Relationship": "Relationship",
    "Lockdown_Status": "Lockdown_Status",
}

# Cache for loaded model artifacts
_model_cache = {}


def _load_global_artifacts():
    """
    Load the GLOBAL model and its artifacts.
    Uses caching to avoid reloading on every prediction.
    """
    global _model_cache
    
    if _model_cache:
        return _model_cache
    
    global_dir = os.path.join(MODELS_DIR, "GLOBAL")
    
    required_files = ["model.keras", "encoder.pkl", "scaler.pkl", "feature_info.pkl"]
    
    # Check all required files exist
    for f in required_files:
        fpath = os.path.join(global_dir, f)
        if not os.path.exists(fpath):
            raise FileNotFoundError(f"Model artifact not found: {fpath}. Please ensure the trained model is in {global_dir}")
    
    # Load artifacts
    model = load_model(os.path.join(global_dir, "model.keras"))
    encoder = joblib.load(os.path.join(global_dir, "encoder.pkl"))
    scaler = joblib.load(os.path.join(global_dir, "scaler.pkl"))
    feature_info = joblib.load(os.path.join(global_dir, "feature_info.pkl"))
    
    _model_cache = {
        "model": model,
        "encoder": encoder,
        "scaler": scaler,
        "feature_info": feature_info,
        "global_dir": global_dir
    }
    
    return _model_cache


def _severity_to_numeric(severity_input):
    """Convert severity string/number to numeric value (1.0, 2.0, 3.0)"""
    severity_mapping = {
        "low": 1.0, "medium": 2.0, "high": 3.0,
        "1": 1.0, "2": 2.0, "3": 3.0,
        1: 1.0, 2: 2.0, 3: 3.0
    }
    
    if isinstance(severity_input, (int, float)):
        return float(severity_input)
    
    severity_str = str(severity_input).strip().lower()
    return severity_mapping.get(severity_str, 1.0)


def get_trained_case_types():
    """
    Get the list of case types the model was trained on.
    Returns None if model is not available.
    """
    try:
        artifacts = _load_global_artifacts()
        encoder = artifacts["encoder"]
        feature_info = artifacts["feature_info"]
        
        case_type_col = FEATURE_COLS["Case_Type"]
        
        if case_type_col not in feature_info["categorical_columns"]:
            return None
        
        case_type_index = feature_info["categorical_columns"].index(case_type_col)
        return sorted(encoder.categories_[case_type_index].tolist())
    
    except Exception as e:
        print(f"Error getting trained case types: {e}")
        return None


def get_settlement_types():
    """
    Get the list of settlement types the model predicts for.
    """
    try:
        artifacts = _load_global_artifacts()
        encoder = artifacts["encoder"]
        feature_info = artifacts["feature_info"]
        
        settlement_col = FEATURE_COLS["Settlement_Type"]
        
        if settlement_col not in feature_info["categorical_columns"]:
            return ["Amicable Settlement", "Arbitration", "Certificate to File Action", "Dismissed"]
        
        settlement_index = feature_info["categorical_columns"].index(settlement_col)
        return sorted(encoder.categories_[settlement_index].tolist())
    
    except Exception:
        return ["Amicable Settlement", "Arbitration", "Certificate to File Action", "Dismissed"]


def get_relationship_types():
    """
    Get the list of relationship types the model was trained on.
    """
    try:
        artifacts = _load_global_artifacts()
        encoder = artifacts["encoder"]
        feature_info = artifacts["feature_info"]
        
        relationship_col = FEATURE_COLS["Relationship"]
        
        if relationship_col not in feature_info["categorical_columns"]:
            return ["Neighbor", "Family", "Coworker", "Stranger", "Ex-Partner", "Tenant/Landlord"]
        
        relationship_index = feature_info["categorical_columns"].index(relationship_col)
        return sorted(encoder.categories_[relationship_index].tolist())
    
    except Exception:
        return ["Neighbor", "Family", "Coworker", "Stranger", "Ex-Partner", "Tenant/Landlord"]


def predict_case_outcomes(
    case_type: str,
    severity,
    relationship: str,
    num_complainants: int,
    num_respondents: int,
    lockdown_status: str = "Normal"
) -> dict:
    """
    Predict case outcomes for all settlement types.
    
    Args:
        case_type: Type of case (e.g., "Grave Threats")
        severity: Severity level (1, 2, 3 or "Low", "Medium", "High")
        relationship: Relationship between parties (e.g., "Neighbor")
        num_complainants: Number of complainants
        num_respondents: Number of respondents
        lockdown_status: COVID lockdown status (default: "Normal")
    
    Returns:
        Dictionary with predictions for each settlement type
    """
    try:
        artifacts = _load_global_artifacts()
        model = artifacts["model"]
        encoder = artifacts["encoder"]
        scaler = artifacts["scaler"]
        feature_info = artifacts["feature_info"]
        
        categorical_cols = feature_info.get("categorical_columns", [])
        numeric_cols = feature_info.get("numeric_columns", [])
        
        # Get settlement types from encoder
        try:
            settlement_idx = categorical_cols.index(FEATURE_COLS["Settlement_Type"])
            settlements = encoder.categories_[settlement_idx].tolist()
        except Exception:
            settlements = ["Amicable Settlement", "Arbitration", "Certificate to File Action", "Dismissed"]
        
        # Convert inputs to proper types
        severity_numeric = _severity_to_numeric(severity)
        num_complainants = float(num_complainants)
        num_respondents = float(num_respondents)
        
        results = {}
        
        # Predict for each settlement type
        for settlement in settlements:
            try:
                # Calculate engineered features (must match train_model.py)
                parties_total = num_complainants + num_respondents
                party_ratio = num_complainants / max(num_respondents, 1.0)
                
                # Temporal features - use current date
                import datetime as dt
                now = dt.datetime.now()
                month = now.month
                quarter = (now.month - 1) // 3 + 1
                year_normalized = min(now.year - 2018, 10)
                
                # Case complexity using data-driven weights from training
                cw = feature_info.get("complexity_weights", {
                    "Severity": 0.558, 
                    "Parties_Total": 0.252, 
                    "Party_Ratio": 0.189
                })
                case_complexity = (
                    severity_numeric * cw.get("Severity", 0.558) +
                    parties_total * cw.get("Parties_Total", 0.252) +
                    party_ratio * cw.get("Party_Ratio", 0.189)
                )
                
                # Construct input row
                input_row = pd.DataFrame([{
                    "Case_Type": case_type,
                    "Settlement_Type": settlement,
                    "Severity": severity_numeric,
                    "Num_Complainants": num_complainants,
                    "Num_Respondents": num_respondents,
                    "Relationship": relationship,
                    "Lockdown_Status": lockdown_status,
                    "Parties_Total": parties_total,
                    "Party_Ratio": party_ratio,
                    "Month": month,
                    "Quarter": quarter,
                    "Year_Normalized": year_normalized,
                    "Case_Complexity": case_complexity
                }])
                
                # Transform features
                Xc = encoder.transform(input_row[categorical_cols])
                Xn = scaler.transform(input_row[numeric_cols])
                X_all = np.hstack([Xc, Xn])
                
                # Make prediction
                preds = model.predict(X_all, verbose=0)
                
                if isinstance(preds, list) and len(preds) >= 2:
                    # Cap predicted hearings at 6 maximum (barangay mediation limit)
                    raw_hearings = int(round(preds[0].flatten()[0]))
                    pred_hearings = min(6, max(1, raw_hearings))
                    pred_days = max(1, int(round(preds[1].flatten()[0])))
                else:
                    pred_hearings = 3
                    pred_days = 21
                
                results[settlement] = {
                    "predicted_hearings": pred_hearings,
                    "predicted_days": pred_days,
                    "predicted_weeks": round(pred_days / 7, 1)
                }
                
            except Exception as e:
                print(f"Error predicting for settlement '{settlement}': {e}")
                continue
        
        return {
            "success": True,
            "predictions": results,
            "input_summary": {
                "case_type": case_type,
                "severity": int(severity_numeric),
                "relationship": relationship,
                "num_complainants": int(num_complainants),
                "num_respondents": int(num_respondents)
            }
        }
        
    except FileNotFoundError as e:
        return {
            "success": False,
            "error": str(e),
            "predictions": {}
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Prediction error: {str(e)}",
            "predictions": {}
        }


def get_model_info():
    """
    Get information about the loaded model.
    """
    try:
        artifacts = _load_global_artifacts()
        feature_info = artifacts["feature_info"]
        
        return {
            "success": True,
            "model_loaded": True,
            "categorical_features": feature_info.get("categorical_columns", []),
            "numeric_features": feature_info.get("numeric_columns", []),
            "trained_case_types": get_trained_case_types(),
            "settlement_types": get_settlement_types(),
            "relationship_types": get_relationship_types(),
            "complexity_weights": feature_info.get("complexity_weights", {})
        }
    except Exception as e:
        return {
            "success": False,
            "model_loaded": False,
            "error": str(e)
        }
