from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FacultyViewSet, generate_questions

router = DefaultRouter()
router.register(r'faculty', FacultyViewSet)

urlpatterns = [
    path('generate-questions/', generate_questions, name='generate-questions'),
    path('', include(router.urls)),
]
