from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    SEX_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
    ]

    role=None
    username = models.CharField(max_length=150, blank=True, null=True,unique=False)
    email = models.EmailField(unique=True)
    

    # Add your custom fields
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    sex = models.CharField(max_length=10, choices=SEX_CHOICES, blank=True, null=True)
    contact_number = models.CharField(max_length=20, null=True, blank=True)
    barangay = models.CharField(max_length=100, default="Tetuan")
    street = models.CharField(max_length=100, blank=True, null=True)
    additional_info = models.TextField(blank=True, null=True)

    is_user = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_superadmin = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

 