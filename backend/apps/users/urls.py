"""Users app URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .google_auth import google_login

app_name = 'users'

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('profile/', views.UpdateProfileView.as_view(), name='update-profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('auth/google/', google_login, name='google-login'),
    path('', include(router.urls)),
]
