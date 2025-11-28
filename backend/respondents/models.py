from django.db import models

class Respondent(models.Model):
    SEX_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
    ]

    # Basic info
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, blank=True, null=True)
    contact_number = models.CharField(max_length=20, null=True, blank=True)
    barangay = models.CharField(max_length=100, default="Tetuan")
    street = models.CharField(max_length=100, blank=True, null=True)
    additional_info = models.TextField(blank=True, null=True)


    def __str__(self):
        return f"{self.first_name} {self.last_name}"
