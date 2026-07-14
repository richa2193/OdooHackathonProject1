from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Faculty(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    designation = models.CharField(max_length=100)
    joining_date = models.DateField()
    qualifications = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.employee_id})"

    class Meta:
        verbose_name_plural = 'Faculties'
