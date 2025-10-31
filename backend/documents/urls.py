from rest_framework.routers import DefaultRouter
from documents.views import DocumentTemplateViewSet, GeneratedDocumentViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r'templates', DocumentTemplateViewSet, basename='template')
router.register(r'generated-documents', GeneratedDocumentViewSet, basename='generated-document')

urlpatterns = [
    # your other paths...
    path('', include(router.urls)),
]