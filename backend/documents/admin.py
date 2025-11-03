from django.contrib import admin
from .models import DocumentTemplate, GeneratedDocument

@admin.register(DocumentTemplate)
class DocumentTemplateAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'template_type', 'created_at', 'updated_at')
    search_fields = ('name', 'template_type')
    list_filter = ('template_type',)

@admin.register(GeneratedDocument)
class GeneratedDocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'template', 'case_number', 'created_at')
    search_fields = ('case_number',)
    list_filter = ('template',)
