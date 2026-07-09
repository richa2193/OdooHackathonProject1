from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Student, Attendance
from .serializers import StudentSerializer, AttendanceSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().select_related('user').order_by('enrollment_number')
    serializer_class = StudentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course', 'batch', 'semester']
    search_fields = ['enrollment_number', 'user__first_name', 'user__last_name', 'user__email']
    ordering_fields = ['enrollment_number', 'semester']

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all().select_related('student', 'student__user').order_by('-date')
    serializer_class = AttendanceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['student', 'date', 'subject', 'status']
    search_fields = ['student__enrollment_number', 'student__user__first_name', 'subject']
    ordering_fields = ['date', 'status']
