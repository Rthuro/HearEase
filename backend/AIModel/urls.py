from django.urls import path
from .views import PredictCaseView, ModelInfoView

urlpatterns = [
    path('predict-case/', PredictCaseView.as_view(), name='predict-case'),
    path('model-info/', ModelInfoView.as_view(), name='model-info'),
]
