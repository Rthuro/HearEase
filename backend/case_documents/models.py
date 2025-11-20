from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver
from cases.models import Case
import os


class Document(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=100)
    file = models.FileField(upload_to='uploads/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# --- DELETE FILE FROM STORAGE WHEN DOCUMENT IS DELETED ---
@receiver(post_delete, sender=Document)
def delete_file_on_document_delete(sender, instance, **kwargs):
    """
    Deletes the file from storage when the Document object is deleted.
    """
    if instance.file:
        if os.path.isfile(instance.file.path):
            os.remove(instance.file.path)
