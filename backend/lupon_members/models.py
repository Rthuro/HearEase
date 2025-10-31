from django.db import models

class LuponMember(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
        ('staff', 'Staff'),
    ]

    SEX_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
    ]

    # Basic info
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    middle_name = models.CharField(max_length=50, blank=True, null=True)
    birth_date = models.DateField()
    sex = models.CharField(max_length=10, choices=SEX_CHOICES)
    contact_number = models.CharField(max_length=20)
    barangay = models.CharField(max_length=100, default="Tetuan")
    street = models.CharField(max_length=100)
    additional_info = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')


    # Schedule (Mon–Sat)
    sched = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Schedule(models.Model):
    DAYS = [
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),
    ]

    lupon_member = models.ForeignKey(
        LuponMember,
        on_delete=models.CASCADE,
        related_name="schedules"
    )
    day = models.CharField(max_length=10, choices=DAYS)

    def __str__(self):
        return f"{self.lupon_member} - {self.day}"
