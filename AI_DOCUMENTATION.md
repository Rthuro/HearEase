# HearEase AI Analytics Documentation

## 1. Model Overview & Executive Summary

The HearEase AI module is a predictive engine designed to estimate the duration and effort required to resolve Barangay justice cases. By analyzing historical case data, it provides real-time predictions for:

- **Predicted Hearings**: The number of mediation sessions required (capped at 6).
- **Predicted Duration**: The estimated number of days to resolution.

These insights help Barangay officials manage their dockets and set realistic expectations for complainants and respondents. The system features a continuous learning loop, automatically fine-tuning itself as new cases are resolved.

## 2. Model Architecture

The core of the system is a **Multi-Output Deep Neural Network (DNN)** built with **TensorFlow/Keras**.

- **Type**: Feed-forward Neural Network (Regression)
- **Input Layer**: Processes a concatenated vector of One-Hot Encoded categorical features and Scaled numeric features.
- **Hidden Layers**: Dense layers with activation functions (structure defined in `train_model.py` - loaded dynamically).
- **Output Layer**: Two separate output neurons:
  1.  `Hearings` (Regression)
  2.  `Days` (Regression)
- **Artifacts**:
  - `model.keras`: The saved Keras model.
  - `encoder.pkl`: OneHotEncoder for categorical variables.
  - `scaler.pkl`: StandardScaler for numeric variables.
  - `feature_info.pkl`: Metadata about columns and weights.

## 3. Data DNA

The model relies on a specific set of features ("DNA") to understand case complexity.

### Inputs (Features)

| Feature Type | Field Name | Description |
| :--- | :--- | :--- |
| **Categorical** | `Case_Type` | E.g., "Grave Threats", "Estafa". |
| | `Settlement_Type` | E.g., "Amicable Settlement", "Arbitration". |
| | `Relationship` | E.g., "Neighbor", "Family". |
| | `Lockdown_Status` | Context marker (e.g., "Normal", "ECQ"). |
| **Numeric** | `Severity` | Mapped value (1.0 = Low, 2.0 = Med, 3.0 = High). |
| | `Num_Complainants` | Count of accusing parties. |
| | `Num_Respondents` | Count of accused parties. |
| **Engineered** | `Parties_Total` | `Num_Complainants + Num_Respondents` |
| | `Party_Ratio` | `Num_Complainants / Num_Respondents` |
| | `Case_Complexity` | Weighted score: `0.558*Severity + 0.252*Total + 0.189*Ratio` |
| | `Temporal` | `Month`, `Quarter`, `Year_Normalized` (Seasonality/Trend). |

### Outputs (Targets)

- **Actual Hearings**: Count of hearing records for the case.
- **Actual Days**: Days elapsed between the first and last hearing.

## 4. Retraining Cycle

The system employs **Transfer Learning** to stay relevant. Instead of training from scratch, it fine-tunes the global model using newly resolved cases.

```mermaid
graph TD
    A[Case Resolved] -->|Trigger| B(Increment Counter)
    B --> C{Threshold Reached?}
    C -->|No| D[Wait for more cases]
    C -->|Yes| E[Trigger Retrain]
    
    subgraph Retraining Process
    E --> F[Extract Data]
    F --> G[Engineer Features]
    G --> H[Load Global Model]
    H --> I[Back Up Current Model]
    I --> J[Fine-Tune (Fit)]
    J --> K[Evaluate & Save]
    end
    
    K --> L[New Model Live]
```

### Retraining Logic
1.  **Trigger**: Every time a case is marked `resolved`, `increment_resolved_count()` is called.
2.  **Threshold**: If `cases_since_last_train` >= `threshold` (default 5), retraining starts.
3.  **Fine-Tuning**:
    - Loads the existing `model.keras`.
    - Updates the `OneHotEncoder` if new categories (e.g., new Case Types) appear.
    - Trains for a default of 50 epochs with `EarlyStopping`.
    - **Safety**: Automatically backs up the previous model to `backend/AIModel/models/versions/` before saving.

## 5. Validation Strategy

The model optimizes for **Mean Squared Error (MSE)** during training but is best evaluated using **Mean Absolute Error (MAE)** for human readability.

- **Loss Function**: MSE (Penalizes large errors heavily).
- **Monitoring**: Validation Loss (on 20% split) prevents overfitting.
- **Fallback**: If the model predicts `< 1` hearing, it is capped at `1`. If > 6, capped at `6`. Default fallback (if error) is 3 hearings / 21 days.

## 6. Developer Guide

### Manual Retraining
You can force a retraining session via the Django shell or API.

```python
# Django Shell
from backend.AIModel.retrain_model import check_and_trigger_retrain

# Force immediate retraining
check_and_trigger_retrain(force=True, triggered_by='manual')
```

### Configuration
Retraining parameters are stored in the `RetrainConfig` model:
- `auto_retrain_enabled`: Toggle automatic retraining.
- `threshold_cases`: How many cases to collect before retraining.
- `default_epochs`: Max training iterations.

### File Structure
- `backend/AIModel/predictor.py`: Inference logic.
- `backend/AIModel/retrain_model.py`: Training pipeline.
- `backend/AIModel/models/GLOBAL/`: Active model artifacts.
