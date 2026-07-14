from rest_framework import serializers
from .models import Student, Attendance
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class StudentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Student
        fields = ('id', 'user', 'user_details', 'enrollment_number', 'batch', 'course', 'semester')
        
    def validate_user(self, value):
        if value.role != User.Role.STUDENT:
            raise serializers.ValidationError("The associated user must have the STUDENT role.")
        return value

class AttendanceSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ('id', 'student', 'student_details', 'date', 'status', 'subject', 'remarks')
