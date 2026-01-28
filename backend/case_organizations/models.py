from django.db import models

class CaseOrganization(models.Model):
    name = models.CharField(max_length=200, help_text="Name of Company, NGO, etc.")
    representative_name = models.CharField(max_length=150, blank=True, null=True, help_text="Who is representing this org?")
    
    email = models.EmailField(max_length=150, blank=True, null=True)
    contact_number = models.CharField(max_length=20, null=True, blank=True)
    
    barangay = models.CharField(max_length=100, default="Tetuan")
    street = models.CharField(max_length=100, blank=True, null=True)
    
    additional_info = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name