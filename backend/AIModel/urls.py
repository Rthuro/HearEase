from django.urls import path
from .views import PredictCaseView, ModelInfoView, TriggerRetrainView, SettlementPredictionView

urlpatterns = [
    path('predict-case/', PredictCaseView.as_view(), name='predict-case'),
    path('model-info/', ModelInfoView.as_view(), name='model-info'),
    path('trigger-retrain/', TriggerRetrainView.as_view(), name='trigger-retrain'),
    path('predict-settlement/', SettlementPredictionView.as_view(), name='predict-settlement'),
]

