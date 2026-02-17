# views.py
import os
from rest_framework import viewsets, parsers
from .models import Document
from .serializers import DocumentSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        queryset = Document.objects.all()
        case_number = self.request.query_params.get('case_number')
        if case_number:
            queryset = queryset.filter(case=case_number)
        return queryset
    
    def perform_destroy(self, instance):
        # 1. Get the file path before deleting the record
        if instance.file:
            if os.path.isfile(instance.file.path):
                os.remove(instance.file.path) # Delete actual file from 'uploads'
        
        # 2. Delete the database record
        instance.delete()
    