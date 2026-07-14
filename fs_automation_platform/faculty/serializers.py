from rest_framework import serializers
from .models import Faculty
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class FacultySerializer(serializers.ModelSerializer):
    # Nested serializer to include user details when reading
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Faculty
        fields = ('id', 'user', 'user_details', 'employee_id', 'designation', 'joining_date', 'qualifications')
        
    def validate_user(self, value):
        # Validate that the associated user actually has the FACULTY role
        if value.role != User.Role.FACULTY:
            raise serializers.ValidationError("The associated user must have the FACULTY role.")
        return value
