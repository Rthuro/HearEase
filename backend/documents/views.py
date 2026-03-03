import os

from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.template import Template, Context
from .models import DocumentTemplate, GeneratedDocument
from .serializers import DocumentTemplateSerializer, GenerateDocumentSerializer, GeneratedDocumentSerializer
from docxtpl import DocxTemplate
import io
from rest_framework.parsers import MultiPartParser, FormParser

# class DocumentTemplateListCreateView(APIView):
#     """Handles listing and creating document templates"""
#     def get(self, request):
#         templates = DocumentTemplate.objects.all()
#         serializer = DocumentTemplateSerializer(templates, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = DocumentTemplateSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DocumentTemplateListCreateView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        templates = DocumentTemplate.objects.all().order_by('-created_at')
        
        serializer = DocumentTemplateSerializer(
            templates, 
            many=True, 
            context={'request': request}
        )
        return Response(serializer.data)

    def post(self, request):
        serializer = DocumentTemplateSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# class DocumentTemplateDetailView(APIView):
#     """Handles Fetching, Updating, and Deleting a single template"""
    
#     def get_object(self, pk):
#         try:
#             return DocumentTemplate.objects.get(pk=pk)
#         except DocumentTemplate.DoesNotExist:
#             return None

#     def get(self, request, pk):
#         template = self.get_object(pk)
#         if not template:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
#         serializer = DocumentTemplateSerializer(template)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         template = self.get_object(pk)
#         if not template:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
#         serializer = DocumentTemplateSerializer(template, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         template = self.get_object(pk)
#         if not template:
#             return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
#         template.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)

class DocumentTemplateDetailView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get_object(self, pk):
        try:
            return DocumentTemplate.objects.get(pk=pk)
        except DocumentTemplate.DoesNotExist:
            return None

    def put(self, request, pk):
        template = self.get_object(pk)
        if not template:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

        old_file_path = template.docx_file.path if template.docx_file else None
        
        new_file_uploaded = 'docx_file' in request.FILES

        serializer = DocumentTemplateSerializer(template, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            if new_file_uploaded and old_file_path and os.path.exists(old_file_path):
                if old_file_path != template.docx_file.path:
                    os.remove(old_file_path)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        template = self.get_object(pk)
        if not template:
            return Response({'error': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)

        file_path = template.docx_file.path if template.docx_file else None

        template.delete()

        if file_path and os.path.exists(file_path):
            os.remove(file_path)

        return Response({"message": "Template and file deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
# class GenerateDocumentView(APIView):
#     """Generate a document from a template and context data"""
#     def post(self, request, pk):
#         try:
#             template_data = DocumentTemplate.objects.get(id=pk)
#         except DocumentTemplate.DoesNotExist:
#             return Response({'error': 'Template not found: ' + str(pk)}, status=status.HTTP_404_NOT_FOUND)

#         serializer = GenerateDocumentSerializer(data=request.data)
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#         data = serializer.validated_data['data']

#         django_template = Template(template_data.html_content)
#         css_template = template_data.css_styles
#         context = Context(data)
#         generated_html = django_template.render(context)

#         generated_doc = GeneratedDocument.objects.create(
#             template=template_data,
#             case_number=data.get('case_number', 'N/A'),
#             generated_data=data,
#             generated_html=generated_html
#         )

#         return Response({
#             'id': generated_doc.id,
#             'html': generated_html,
#             'css': css_template
#         }, status=status.HTTP_201_CREATED)


class GeneratedDocumentListView(APIView):
    """Lists all generated documents"""
    def get(self, request):
        docs = GeneratedDocument.objects.all()
        serializer = GeneratedDocumentSerializer(docs, many=True, context={'request': request})
        return Response(serializer.data)

class GenerateDocumentView(APIView):
    def post(self, request, pk):
        template_obj = DocumentTemplate.objects.get(id=pk)
        data = request.data.get('data') # e.g., {"name": "John Doe", "date": "2023-10-01"}

        # 1. Load the docx template
        doc = DocxTemplate(template_obj.docx_file.path)

        # 2. Replace placeholders (Jinja2 style)
        # This keeps all fonts, colors, and images exactly as they are in Word
        doc.render(data)

        # 3. Save to a byte stream to send back to React
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)

        # 4. Return as a downloadable file
        response = HttpResponse(
            buffer.getvalue(),
            content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        response['Content-Disposition'] = f'attachment; filename="generated.docx"'
        return response

class TemplateInfoView(APIView):
    def get(self, request, pk):
        try:
            template_obj = DocumentTemplate.objects.get(id=pk)
            print("Template found: ", template_obj.docx_file)
            doc = DocxTemplate(template_obj.docx_file.path)
            
            placeholders = doc.get_undeclared_template_variables()
            
            return Response({
                'placeholders': list(placeholders)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)