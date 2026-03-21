from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreateOrganizationProfileView.as_view(), name='create_organization'),
    path('profile/', views.GetOrganizationProfileView.as_view(), name='get_organization'),
    path('update/', views.UpdateOrganizationProfileView.as_view(), name='update_organization'),
    path('list/', views.ListOrganizationsView.as_view(), name='list_organizations'),
    path('approve/<int:pk>/', views.ApproveOrganizationView.as_view(), name='approve_organization'),
]