from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    enrollment_number = models.CharField(max_length=50, unique=True)
    batch = models.CharField(max_length=50) # e.g., 2023-2027
    course = models.CharField(max_length=100) # e.g., B.Tech Computer Science
    semester = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.enrollment_number})"

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')
    subject = models.CharField(max_length=100)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('student', 'date', 'subject')

    def __str__(self):
        return f"{self.student.enrollment_number} - {self.subject} - {self.date}: {self.status}"
