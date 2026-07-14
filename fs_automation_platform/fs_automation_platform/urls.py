"""
URL configuration for fs_automation_platform project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({"message": "Welcome to the FacultyFlow API!"})

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    
    # JWT Authentication Endpoints (Login/Refresh)
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Accounts App Endpoints (Register, Profile, Passwords)
    path('api/accounts/', include('accounts.urls')),
    
    # Faculty App Endpoints (CRUD)
    path('api/', include('faculty.urls')),
    path('api/', include('students.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all route to serve the React SPA for any unhandled URLs (excluding /api/ and /admin/)
urlpatterns += [
    re_path(r'^(?!api/|admin/|media/|static/).*$', TemplateView.as_view(template_name='index.html')),
]
