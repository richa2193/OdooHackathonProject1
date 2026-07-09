"""
URL configuration for fs_automation_platform project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
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
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
