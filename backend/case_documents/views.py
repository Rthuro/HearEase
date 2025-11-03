# views.py
from rest_framework import viewsets, parsers
from .models import Document
from .serializers import DocumentSerializer

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
