from django.contrib import admin
from .models import Student, Attendance

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('enrollment_number', 'user', 'course', 'batch', 'semester')
    search_fields = ('enrollment_number', 'user__first_name', 'user__last_name', 'user__email')
    list_filter = ('course', 'batch', 'semester')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'subject', 'status')
    list_filter = ('date', 'subject', 'status')
    search_fields = ('student__enrollment_number', 'student__user__first_name', 'student__user__last_name', 'subject')
