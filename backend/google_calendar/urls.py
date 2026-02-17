from django.urls import path
from . import views

urlpatterns = [
    path('auth-url/', views.GoogleAuthURLView.as_view(), name='google-auth-url'),
    path('callback/', views.GoogleCallbackView.as_view(), name='google-callback'),
    path('status/', views.GoogleConnectionStatusView.as_view(), name='google-status'),
    path('disconnect/', views.GoogleDisconnectView.as_view(), name='google-disconnect'),
    path('sync-all/', views.SyncAllHearingsView.as_view(), name='google-sync-all'),
    path('holidays/', views.HolidaysView.as_view(), name='google-holidays'),
    path('sync-settings/', views.CalendarSyncSettingsView.as_view(), name='google-sync-settings'),
    path('sync-preferences/', views.UserSyncPreferencesView.as_view(), name='google-sync-preferences'),
    path('my-hearings/', views.UserHearingsListView.as_view(), name='google-my-hearings'),
]
