from django.urls import path
from . import views

urlpatterns = [
    path('coordinator/', views.CoordinatorDashboardView.as_view(), name='coordinator_dashboard'),
]