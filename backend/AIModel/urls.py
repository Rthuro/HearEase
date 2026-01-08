from django.urls import path
from .views import PredictCaseView, ModelInfoView, TriggerRetrainView

urlpatterns = [
    path('predict-case/', PredictCaseView.as_view(), name='predict-case'),
    path('model-info/', ModelInfoView.as_view(), name='model-info'),
    path('trigger-retrain/', TriggerRetrainView.as_view(), name='trigger-retrain'),
]
