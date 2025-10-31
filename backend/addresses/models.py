from django.db import models

class Barangay(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Street(models.Model):
    name = models.CharField(max_length=100)
    barangay = models.ForeignKey(
        Barangay,
        on_delete=models.CASCADE,
        related_name="streets"
    )

    class Meta:
        unique_together = ("name", "barangay")
        ordering = ["barangay__name", "name"]

    def __str__(self):
        return f"{self.name} ({self.barangay.name})"
