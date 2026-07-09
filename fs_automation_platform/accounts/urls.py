from django.urls import path
from .views import (
    RegisterAPIView,
    LogoutAPIView,
    UserProfileAPIView,
    ChangePasswordAPIView,
    RequestPasswordResetEmailAPIView,
    PasswordTokenCheckAPIView,
    SetNewPasswordAPIView
)

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='register'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('profile/', UserProfileAPIView.as_view(), name='profile'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('request-reset-email/', RequestPasswordResetEmailAPIView.as_view(), name='request-reset-email'),
    path('password-reset/<uidb64>/<token>/', PasswordTokenCheckAPIView.as_view(), name='password-reset-confirm'),
    path('password-reset-complete/', SetNewPasswordAPIView.as_view(), name='password-reset-complete'),
]
