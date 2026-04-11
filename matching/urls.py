from django.urls import path

from . import views


urlpatterns = [
    path('run/', views.RunMatchingView.as_view(), name='run_matching'),
    path('suggestions/', views.MatchSuggestionsView.as_view(), name='match_suggestions'),
    path('assignments/', views.MatchAssignmentsView.as_view(), name='match_assignments'),
    path('confirm/', views.ConfirmMatchView.as_view(), name='confirm_match'),
    path('override/', views.OverrideMatchView.as_view(), name='override_match'),
]
