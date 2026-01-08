"""
Model Retraining Module for HearEase
Fine-tunes the existing Keras model using new resolved cases from the database.
"""

import os
import shutil
import warnings
from datetime import datetime

import numpy as np
import pandas as pd
import joblib

# Suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
warnings.filterwarnings('ignore')

import tensorflow as tf
tf.get_logger().setLevel('ERROR')

from tensorflow.keras.models import load_model
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# Get module directory
MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(MODULE_DIR, "models")
GLOBAL_DIR = os.path.join(MODELS_DIR, "GLOBAL")
VERSIONS_DIR = os.path.join(MODELS_DIR, "versions")

# Feature columns (must match predictor.py)
CATEGORICAL_COLS = ["Case_Type", "Settlement_Type", "Relationship", "Lockdown_Status"]
NUMERIC_COLS = [
    "Severity", "Num_Complainants", "Num_Respondents",
    "Parties_Total", "Party_Ratio", "Month", "Quarter",
    "Year_Normalized", "Case_Complexity"
]


def extract_resolved_cases():
    """
    Extract resolved cases from the Django database.
    Returns a DataFrame with training features and targets.
    """
    # Import Django models (must be called after Django setup)
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hearease_main.settings')
    django.setup()
    
    from cases.models import Case
    from hearings.models import Hearing
    from django.db.models import Count, Min, Max
    
    # Get resolved cases with hearings
    resolved_cases = Case.objects.filter(
        case_status='resolved',
        settlement_type__isnull=False
    ).annotate(
        hearing_count=Count('hearings'),
        first_hearing=Min('hearings__hearing_date'),
        last_hearing=Max('hearings__hearing_date')
    ).filter(
        hearing_count__gt=0
    ).select_related('case_type', 'settlement_type', 'relationship')
    
    rows = []
    for case in resolved_cases:
        # Calculate resolution days
        if case.first_hearing and case.last_hearing:
            resolution_days = (case.last_hearing - case.first_hearing).days + 1
        else:
            resolution_days = 7  # Default if no proper dates
        
        # Get counts
        num_complainants = case.complainants.count()
        num_respondents = case.respondents.count()
        
        # Extract features
        row = {
            "Case_Type": case.case_type.case_name if case.case_type else "Unknown",
            "Settlement_Type": case.settlement_type.settlement_name if case.settlement_type else "Unknown",
            "Severity": float(case.case_type.severity if case.case_type else 1),
            "Num_Complainants": float(max(1, num_complainants)),
            "Num_Respondents": float(max(1, num_respondents)),
            "Relationship": case.relationship.relationship if case.relationship else "Neighbor",
            "Lockdown_Status": "Normal",  # Default, adjust if you track this
            "Date_Filed": case.date_filed,
            # Targets
            "Actual_Hearings": case.hearing_count,
            "Actual_Days": max(1, resolution_days),
        }
        rows.append(row)
    
    df = pd.DataFrame(rows)
    
    if len(df) == 0:
        raise ValueError("No resolved cases found in database. Cannot retrain.")
    
    return df


def engineer_features(df):
    """
    Engineer features to match the predictor's expectations.
    """
    df = df.copy()
    
    # Derived features
    df["Parties_Total"] = df["Num_Complainants"] + df["Num_Respondents"]
    df["Party_Ratio"] = df["Num_Complainants"] / df["Num_Respondents"].clip(lower=1)
    
    # Temporal features
    if "Date_Filed" in df.columns:
        df["Month"] = pd.to_datetime(df["Date_Filed"]).dt.month
        df["Quarter"] = ((df["Month"] - 1) // 3 + 1).astype(float)
        df["Year_Normalized"] = (pd.to_datetime(df["Date_Filed"]).dt.year - 2018).clip(upper=10).astype(float)
    else:
        now = datetime.now()
        df["Month"] = float(now.month)
        df["Quarter"] = float((now.month - 1) // 3 + 1)
        df["Year_Normalized"] = float(min(now.year - 2018, 10))
    
    # Case complexity
    cw = {"Severity": 0.558, "Parties_Total": 0.252, "Party_Ratio": 0.189}
    df["Case_Complexity"] = (
        df["Severity"] * cw["Severity"] +
        df["Parties_Total"] * cw["Parties_Total"] +
        df["Party_Ratio"] * cw["Party_Ratio"]
    )
    
    return df


def load_existing_artifacts():
    """
    Load the existing model and preprocessing artifacts.
    """
    model = load_model(os.path.join(GLOBAL_DIR, "model.keras"))
    encoder = joblib.load(os.path.join(GLOBAL_DIR, "encoder.pkl"))
    scaler = joblib.load(os.path.join(GLOBAL_DIR, "scaler.pkl"))
    feature_info = joblib.load(os.path.join(GLOBAL_DIR, "feature_info.pkl"))
    
    return model, encoder, scaler, feature_info


def backup_current_model():
    """
    Create a versioned backup of the current model.
    """
    os.makedirs(VERSIONS_DIR, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join(VERSIONS_DIR, timestamp)
    
    if os.path.exists(GLOBAL_DIR):
        shutil.copytree(GLOBAL_DIR, backup_dir)
        return backup_dir
    return None


def restore_from_backup(backup_dir):
    """
    Restore model from a backup.
    """
    if backup_dir and os.path.exists(backup_dir):
        if os.path.exists(GLOBAL_DIR):
            shutil.rmtree(GLOBAL_DIR)
        shutil.copytree(backup_dir, GLOBAL_DIR)
        return True
    return False


def fine_tune_model(epochs=50, validation_split=0.2):
    """
    Fine-tune the existing model with new data from the database.
    
    Returns:
        dict: Result with success status, metrics, and message.
    """
    result = {
        "success": False,
        "message": "",
        "samples_trained": 0,
        "metrics": {}
    }
    
    try:
        # 1. Extract data
        print("[Retrain] Extracting resolved cases from database...")
        df = extract_resolved_cases()
        print(f"[Retrain] Found {len(df)} resolved cases")
        
        if len(df) < 5:
            result["message"] = f"Insufficient data: only {len(df)} cases. Need at least 5."
            return result
        
        # 2. Engineer features
        print("[Retrain] Engineering features...")
        df = engineer_features(df)
        
        # 3. Load existing model and artifacts
        print("[Retrain] Loading existing model...")
        model, encoder, scaler, feature_info = load_existing_artifacts()
        
        # 4. Prepare features
        X_cat = df[CATEGORICAL_COLS]
        X_num = df[NUMERIC_COLS]
        
        # Transform using existing encoder/scaler
        try:
            X_cat_enc = encoder.transform(X_cat)
        except Exception as e:
            # If new categories exist, refit encoder
            print(f"[Retrain] Refitting encoder due to new categories: {e}")
            encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
            encoder.fit(X_cat)
            X_cat_enc = encoder.transform(X_cat)
        
        X_num_scaled = scaler.transform(X_num)
        X_all = np.hstack([X_cat_enc, X_num_scaled])
        
        # Targets
        y_hearings = df["Actual_Hearings"].values.astype(float)
        y_days = df["Actual_Days"].values.astype(float)
        
        # 5. Backup current model
        print("[Retrain] Backing up current model...")
        backup_dir = backup_current_model()
        
        # 6. Fine-tune
        print("[Retrain] Fine-tuning model...")
        early_stop = EarlyStopping(
            monitor='loss',
            patience=10,
            restore_best_weights=True
        )
        
        history = model.fit(
            X_all,
            [y_hearings, y_days],
            epochs=epochs,
            batch_size=min(32, len(df)),
            validation_split=validation_split,
            callbacks=[early_stop],
            verbose=0
        )
        
        # 7. Evaluate
        final_loss = history.history['loss'][-1]
        val_loss = history.history.get('val_loss', [None])[-1]
        
        print(f"[Retrain] Final loss: {final_loss:.4f}, Val loss: {val_loss:.4f if val_loss else 'N/A'}")
        
        # 8. Save updated model
        print("[Retrain] Saving updated model...")
        model.save(os.path.join(GLOBAL_DIR, "model.keras"))
        joblib.dump(encoder, os.path.join(GLOBAL_DIR, "encoder.pkl"))
        
        # Update feature_info with training timestamp
        feature_info["last_trained"] = datetime.now().isoformat()
        feature_info["training_samples"] = len(df)
        feature_info["categorical_columns"] = CATEGORICAL_COLS
        feature_info["numeric_columns"] = NUMERIC_COLS
        joblib.dump(feature_info, os.path.join(GLOBAL_DIR, "feature_info.pkl"))
        
        # 9. Clear model cache in predictor
        from . import predictor
        predictor._model_cache.clear()
        
        result["success"] = True
        result["message"] = f"Successfully fine-tuned on {len(df)} cases"
        result["samples_trained"] = len(df)
        result["metrics"] = {
            "final_loss": float(final_loss),
            "val_loss": float(val_loss) if val_loss else None,
            "epochs_trained": len(history.history['loss']),
            "backup_location": backup_dir
        }
        
        print(f"[Retrain] Complete! {result['message']}")
        return result
        
    except Exception as e:
        result["message"] = f"Retraining failed: {str(e)}"
        print(f"[Retrain] Error: {e}")
        
        # Attempt rollback if we have a backup
        if 'backup_dir' in locals() and backup_dir:
            print("[Retrain] Attempting rollback...")
            if restore_from_backup(backup_dir):
                result["message"] += " (rolled back to previous model)"
        
        return result


if __name__ == "__main__":
    # Allow running directly for testing
    result = fine_tune_model()
    print(f"\nResult: {result}")
