from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreateStudentProfileView.as_view(), name='create_student'),
    path('profile/', views.GetStudentProfileView.as_view(), name='get_student'),
    path('update/', views.UpdateStudentProfileView.as_view(), name='update_student'),
    path('list/', views.ListStudentsView.as_view(), name='list_students'),
    path('detail/<int:pk>/', views.GetSingleStudentView.as_view(), name='get_single_student'),
]