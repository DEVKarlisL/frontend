"""Admin panel app URLs."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'adminpanel'

router = DefaultRouter()
router.register(r'reports', views.ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
    path('settings/', views.SystemSettingsView.as_view(), name='settings'),
    path('users/ban/', views.BanUserView.as_view(), name='ban-user'),
    path('users/unban/', views.UnbanUserView.as_view(), name='unban-user'),
    path('dashboard/', views.DashboardView.as_view(), name='dashboard'),
]
