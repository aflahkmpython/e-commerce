from django.db import models
from django.conf import settings

class AdminAuditLog(models.Model):
    ACTION_CHOICES = (
        ('ROLE_CHANGE', 'Role Change'),
        ('DEACTIVATE', 'Account Deactivation'),
        ('REACTIVATE', 'Account Reactivation'),
        ('STATUS_CHANGE', 'Account Status Change'),
        ('STOCK_UPDATE', 'Stock Update'),
        ('OTHER', 'Other Admin Action'),
    )

    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='activity_logs',
        null=True,
        blank=True
    )
    target_model = models.CharField(max_length=100, blank=True, null=True)
    target_id = models.PositiveIntegerField(blank=True, null=True)
    
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='performed_actions'
    )
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        target = self.target_user.email if self.target_user else f"{self.target_model}:{self.target_id}"
        return f"{self.action} on {target} by {self.performed_by.email if self.performed_by else 'System'}"
