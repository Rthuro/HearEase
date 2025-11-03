from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.template import Template, Context
from .models import DocumentTemplate, GeneratedDocument
from .serializers import DocumentTemplateSerializer, GenerateDocumentSerializer, GeneratedDocumentSerializer


class DocumentTemplateListCreateView(APIView):
    """Handles listing and creating document templates"""
    def get(self, request):
        templates = DocumentTemplate.objects.all()
        serializer = DocumentTemplateSerializer(templates, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DocumentTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GenerateDocumentView(APIView):
    """Generate a document from a template and context data"""
    def post(self, request, pk):
        try:
            template_data = DocumentTemplate.objects.get(id=pk)
        except DocumentTemplate.DoesNotExist:
            return Response({'error': 'Template not found: ' + str(pk)}, status=status.HTTP_404_NOT_FOUND)

        serializer = GenerateDocumentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data['data']

        django_template = Template(template_data.html_content)
        css_template = template_data.css_styles
        context = Context(data)
        generated_html = django_template.render(context)

        generated_doc = GeneratedDocument.objects.create(
            template=template_data,
            case_number=data.get('case_number', 'N/A'),
            generated_data=data,
            generated_html=generated_html
        )

        return Response({
            'id': generated_doc.id,
            'html': generated_html,
            'css': css_template
        }, status=status.HTTP_201_CREATED)


class GeneratedDocumentListView(APIView):
    """Lists all generated documents"""
    def get(self, request):
        docs = GeneratedDocument.objects.all()
        serializer = GeneratedDocumentSerializer(docs, many=True)
        return Response(serializer.data)
