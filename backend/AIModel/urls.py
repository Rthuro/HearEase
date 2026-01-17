from django.urls import path
from .views import (
    PredictCaseView, 
    ModelInfoView, 
    TriggerRetrainView, 
    SettlementPredictionView,
    TrainingStatusView,
    UpdateRetrainConfigView
)

urlpatterns = [
    path('predict-case/', PredictCaseView.as_view(), name='predict-case'),
    path('model-info/', ModelInfoView.as_view(), name='model-info'),
    path('trigger-retrain/', TriggerRetrainView.as_view(), name='trigger-retrain'),
    path('predict-settlement/', SettlementPredictionView.as_view(), name='predict-settlement'),
    path('training-status/', TrainingStatusView.as_view(), name='training-status'),
    path('retrain-config/', UpdateRetrainConfigView.as_view(), name='retrain-config'),
]
