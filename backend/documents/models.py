from django.db import models

class DocumentTemplate(models.Model):
    
    name = models.CharField(max_length=200)
    template_type = models.CharField(max_length=50)
    # html_content = models.TextField()
    # css_styles = models.TextField(blank=True)
    # placeholders = models.JSONField(default=list, blank=True)
    docx_file = models.FileField(upload_to='templates/docs/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class GeneratedDocument(models.Model):
    template = models.ForeignKey(DocumentTemplate, on_delete=models.CASCADE)
    case_number = models.CharField(max_length=100)
    generated_data = models.JSONField()
    generated_file = models.FileField(upload_to='generated_docs/', blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.template.name} - {self.case_number}"