from django.urls import path
from . import views

urlpatterns = [
    path('auth-url/', views.GoogleAuthURLView.as_view(), name='google-auth-url'),
    path('callback/', views.GoogleCallbackView.as_view(), name='google-callback'),
    path('status/', views.GoogleConnectionStatusView.as_view(), name='google-status'),
    path('disconnect/', views.GoogleDisconnectView.as_view(), name='google-disconnect'),
    path('sync-all/', views.SyncAllHearingsView.as_view(), name='google-sync-all'),
]
