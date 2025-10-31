from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
        ('staff', 'Staff'),
    ]

    SEX_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
    ]

    # Add your custom fields
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, blank=True, null=True)
    contact_number = models.CharField(max_length=20, null=True, blank=True)
    barangay = models.CharField(max_length=100, default="Tetuan")
    street = models.CharField(max_length=100, blank=True, null=True)
    additional_info = models.TextField(blank=True, null=True)


    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return self.username or self.email

 