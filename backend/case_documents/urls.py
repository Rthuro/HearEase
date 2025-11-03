from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet

router = DefaultRouter()
router.register(r'case-documents', DocumentViewSet, basename='case-documents')

urlpatterns = [
    path('', include(router.urls)),
]