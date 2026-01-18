"""
AI Model Django models for tracking training history.
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class TrainingHistory(models.Model):
    """
    Tracks model training/retraining events.
    """
    trained_at = models.DateTimeField(auto_now_add=True)
    triggered_by = models.CharField(max_length=50, choices=[
        ('manual', 'Manual Trigger'),
        ('automatic', 'Automatic Threshold'),
        ('initial', 'Initial Training'),
    ], default='manual')
    
    # Training metrics
    samples_trained = models.IntegerField(default=0)
    final_loss = models.FloatField(null=True, blank=True)
    val_loss = models.FloatField(null=True, blank=True)
    epochs_trained = models.IntegerField(default=0)
    
    # Status
    success = models.BooleanField(default=False)
    message = models.TextField(blank=True)
    backup_location = models.CharField(max_length=255, blank=True)
    
    # User who triggered (if manual)
    triggered_by_user = models.ForeignKey(
        User, on_delete=models.SET_NULL, 
        null=True, blank=True,
        related_name='model_trainings'
    )
    
    class Meta:
        ordering = ['-trained_at']
        verbose_name_plural = 'Training Histories'
    
    def __str__(self):
        return f"Training {self.trained_at.strftime('%Y-%m-%d %H:%M')} - {'✓' if self.success else '✗'}"


class RetrainConfig(models.Model):
    """
    Singleton model for retraining configuration.
    """
    # Threshold settings
    auto_retrain_enabled = models.BooleanField(default=True)
    threshold_cases = models.IntegerField(
        default=10, 
        help_text="Number of new resolved cases before auto-retrain"
    )
    
    # Tracking
    cases_since_last_train = models.IntegerField(default=0)
    last_checked_at = models.DateTimeField(auto_now=True)
    
    # Training parameters
    default_epochs = models.IntegerField(default=50)
    default_validation_split = models.FloatField(default=0.2)
    
    class Meta:
        verbose_name = 'Retrain Configuration'
        verbose_name_plural = 'Retrain Configuration'
    
    def save(self, *args, **kwargs):
        # Ensure only one config exists (singleton)
        self.pk = 1
        super().save(*args, **kwargs)
    
    @classmethod
    def get_config(cls):
        """Get or create the singleton config."""
        config, _ = cls.objects.get_or_create(pk=1)
        return config
    
    def __str__(self):
        return f"Retrain Config (threshold: {self.threshold_cases} cases)"
