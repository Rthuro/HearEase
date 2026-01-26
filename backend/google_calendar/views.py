"""
Google Calendar API Views
Handles OAuth flow and sync operations.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from datetime import datetime

from .models import GoogleCalendarToken, CalendarSyncLog
from .service import (
    get_authorization_url,
    exchange_code_for_tokens,
    get_calendar_service,
    create_or_get_hearease_calendar,
    create_hearing_event,
    update_hearing_event,
    delete_hearing_event
)
from hearings.models import Hearing

User = get_user_model()


class GoogleAuthURLView(APIView):
    """
    Generate Google OAuth2 authorization URL.
    
    GET /api/google-calendar/auth-url/
    """
    def get(self, request):
        auth_url, state = get_authorization_url()
        
        # Store state in session for verification
        request.session['google_oauth_state'] = state
        
        return Response({
            "auth_url": auth_url,
            "state": state
        }, status=status.HTTP_200_OK)


class GoogleCallbackView(APIView):
    """
    Handle OAuth2 callback from Google.
    
    GET /api/google-calendar/callback/?code=...&state=...
    """
    def get(self, request):
        code = request.query_params.get('code')
        error = request.query_params.get('error')
        
        print(f"[Google OAuth] Callback received - code: {bool(code)}, error: {error}")
        
        if error:
            # Redirect to frontend with error (using hash routing)
            return redirect(f"http://localhost:5173/#/Admin/Settings?google_error={error}")
        
        if not code:
            return Response(
                {"error": "No authorization code provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Exchange code for tokens
            print("[Google OAuth] Exchanging code for tokens...")
            tokens = exchange_code_for_tokens(code)
            print(f"[Google OAuth] Tokens received - access: {bool(tokens.get('access_token'))}, refresh: {bool(tokens.get('refresh_token'))}")
            
            # Get or create user (for now, use the first admin)
            admin_user = User.objects.filter(is_admin=True).first()
            if not admin_user:
                admin_user = User.objects.filter(is_superadmin=True).first()
            
            print(f"[Google OAuth] Admin user: {admin_user.email if admin_user else 'None'}")
            
            if not admin_user:
                return redirect("http://localhost:5173/#/Admin/Settings?google_error=no_admin")
            
            # Get calendar service and create/get calendar
            print("[Google OAuth] Creating calendar service...")
            service, credentials = get_calendar_service(tokens)
            print("[Google OAuth] Getting/creating HearEase calendar...")
            calendar_id = create_or_get_hearease_calendar(service)
            print(f"[Google OAuth] Calendar ID: {calendar_id}")
            
            # Update token expiry with actual value
            token_expiry = credentials.expiry if credentials.expiry else datetime.utcnow()
            
            # Save tokens
            GoogleCalendarToken.objects.update_or_create(
                user=admin_user,
                defaults={
                    "access_token": tokens["access_token"],
                    "refresh_token": tokens["refresh_token"],
                    "token_expiry": token_expiry,
                    "calendar_id": calendar_id
                }
            )
            print("[Google OAuth] Token saved successfully!")
            
            # Redirect to frontend with success (using hash routing)
            return redirect("http://localhost:5173/#/Admin/Settings?google_connected=true")
            
        except Exception as e:
            import traceback
            print(f"[Google OAuth] ERROR: {e}")
            print(traceback.format_exc())
            return redirect(f"http://localhost:5173/#/Admin/Settings?google_error={str(e)[:50]}")


class GoogleConnectionStatusView(APIView):
    """
    Check if Google Calendar is connected.
    
    GET /api/google-calendar/status/
    """
    def get(self, request):
        # Check if any admin has connected
        token = GoogleCalendarToken.objects.first()
        
        if token:
            return Response({
                "connected": True,
                "connected_user": token.user.email,
                "calendar_id": token.calendar_id,
                "last_updated": token.updated_at.isoformat()
            }, status=status.HTTP_200_OK)
        
        return Response({
            "connected": False
        }, status=status.HTTP_200_OK)


class GoogleDisconnectView(APIView):
    """
    Disconnect Google Calendar.
    
    POST /api/google-calendar/disconnect/
    """
    def post(self, request):
        # Delete all tokens
        deleted_count, _ = GoogleCalendarToken.objects.all().delete()
        
        return Response({
            "disconnected": True,
            "tokens_removed": deleted_count
        }, status=status.HTTP_200_OK)


class SyncAllHearingsView(APIView):
    """
    Sync all future hearings to Google Calendar.
    
    POST /api/google-calendar/sync-all/
    """
    def post(self, request):
        token = GoogleCalendarToken.objects.first()
        
        if not token:
            return Response(
                {"error": "Google Calendar not connected"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            service, credentials = get_calendar_service({
                "access_token": token.access_token,
                "refresh_token": token.refresh_token
            })
            
            # Update token if refreshed
            if credentials.token != token.access_token:
                token.access_token = credentials.token
                if credentials.expiry:
                    token.token_expiry = credentials.expiry
                token.save()
            
            # Get all future hearings
            from datetime import date
            hearings = Hearing.objects.filter(
                hearing_date__gte=date.today()
            ).select_related('case', 'case__case_type', 'lupon_member')
            
            print(f"[Sync] Found {hearings.count()} hearings to sync")
            
            synced = 0
            errors = []
            
            for hearing in hearings:
                try:
                    print(f"[Sync] Processing hearing #{hearing.id} (date: {hearing.hearing_date}, time: {hearing.time})")
                    
                    # Check if hearing has required data
                    if not hearing.hearing_date:
                        raise ValueError("Hearing has no date set")
                    
                    had_event_id = bool(hearing.google_event_id)
                    
                    if hearing.google_event_id:
                        # Update existing
                        print(f"[Sync] Updating existing event: {hearing.google_event_id}")
                        update_hearing_event(
                            service, token.calendar_id, 
                            hearing.google_event_id, hearing
                        )
                    else:
                        # Create new
                        print(f"[Sync] Creating new event for hearing #{hearing.id}")
                        event_id = create_hearing_event(
                            service, token.calendar_id, hearing
                        )
                        hearing.google_event_id = event_id
                        hearing.save(update_fields=['google_event_id'])
                        print(f"[Sync] Created event: {event_id}")
                    
                    synced += 1
                    
                    CalendarSyncLog.objects.create(
                        hearing=hearing,
                        action="update" if had_event_id else "create",
                        google_event_id=hearing.google_event_id,
                        message="Synced successfully"
                    )
                    
                except Exception as e:
                    error_msg = f"Hearing #{hearing.id}: {str(e)}"
                    print(f"[Sync] ERROR: {error_msg}")
                    errors.append(error_msg)
                    CalendarSyncLog.objects.create(
                        hearing=hearing,
                        action="error",
                        message=str(e)
                    )
            
            print(f"[Sync] Complete: {synced}/{hearings.count()} synced, {len(errors)} errors")
            
            return Response({
                "synced": synced,
                "total": hearings.count(),
                "errors": errors if errors else None
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"[Sync] FATAL ERROR: {str(e)}")
            print(traceback.format_exc())
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def sync_hearing_to_google(hearing, action="create"):
    """
    Helper function to sync a single hearing.
    Called from hearing views on create/update/delete.
    Respects CalendarSyncSettings for auto-sync behavior.
    """
    from .models import CalendarSyncSettings
    
    # Check if auto-sync is enabled and action is allowed
    try:
        settings = CalendarSyncSettings.objects.first()
        if not settings or not settings.auto_sync_enabled:
            return None  # Auto-sync is disabled
        
        # Check action-specific settings
        if action == "create" and not settings.sync_on_create:
            return None
        elif action == "update" and not settings.sync_on_update:
            return None
        elif action == "delete" and not settings.sync_on_delete:
            return None
    except Exception:
        return None  # Settings not available
    
    token = GoogleCalendarToken.objects.first()
    
    if not token:
        return None  # Silent fail if not connected
    
    try:
        service, credentials = get_calendar_service({
            "access_token": token.access_token,
            "refresh_token": token.refresh_token
        })
        
        # Update token if refreshed
        if credentials.token != token.access_token:
            token.access_token = credentials.token
            if credentials.expiry:
                token.token_expiry = credentials.expiry
            token.save()
        
        if action == "create":
            event_id = create_hearing_event(service, token.calendar_id, hearing)
            hearing.google_event_id = event_id
            hearing.save(update_fields=['google_event_id'])
            
        elif action == "update" and hearing.google_event_id:
            update_hearing_event(service, token.calendar_id, hearing.google_event_id, hearing)
            
        elif action == "delete" and hearing.google_event_id:
            delete_hearing_event(service, token.calendar_id, hearing.google_event_id)
        
        CalendarSyncLog.objects.create(
            hearing=hearing,
            action=action,
            google_event_id=hearing.google_event_id,
            message="Success"
        )
        
        return True
        
    except Exception as e:
        CalendarSyncLog.objects.create(
            hearing=hearing,
            action="error",
            message=str(e)
        )
        return False


class HolidaysView(APIView):
    """
    Get Philippine holidays for the calendar.
    
    GET /api/google-calendar/holidays/
    Query params:
        - month: Month number (1-12), defaults to current
        - year: Year, defaults to current
    """
    def get(self, request):
        import datetime as dt
        import calendar
        
        now = dt.datetime.now()
        
        try:
            month = int(request.query_params.get('month', now.month))
            year = int(request.query_params.get('year', now.year))
        except (ValueError, TypeError):
            month = now.month
            year = now.year
        
        # Check if we're in the last week of the month
        _, last_day = calendar.monthrange(year, month)
        is_last_week = now.day > (last_day - 7)
        
        # Import the service function
        from .service import get_holidays_for_calendar
        
        holidays = get_holidays_for_calendar(
            year=year,
            month=month,
            include_next_month=is_last_week
        )
        
        return Response({
            "holidays": holidays,
            "month": month,
            "year": year,
            "include_next_month": is_last_week
        }, status=status.HTTP_200_OK)


class CalendarSyncSettingsView(APIView):
    """
    Get/Update calendar sync settings.
    
    GET /api/google-calendar/sync-settings/
    PUT /api/google-calendar/sync-settings/
    """
    def get(self, request):
        from .models import CalendarSyncSettings
        
        # Get or create default settings
        settings_obj, created = CalendarSyncSettings.objects.get_or_create(
            defaults={
                'auto_sync_enabled': False,
                'sync_on_create': True,
                'sync_on_update': True,
                'sync_on_delete': True
            }
        )
        
        return Response({
            "auto_sync_enabled": settings_obj.auto_sync_enabled,
            "sync_on_create": settings_obj.sync_on_create,
            "sync_on_update": settings_obj.sync_on_update,
            "sync_on_delete": settings_obj.sync_on_delete,
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        from .models import CalendarSyncSettings
        
        data = request.data
        
        settings_obj, created = CalendarSyncSettings.objects.get_or_create(
            defaults={
                'auto_sync_enabled': False,
                'sync_on_create': True,
                'sync_on_update': True,
                'sync_on_delete': True
            }
        )
        
        # Update fields if provided
        if 'auto_sync_enabled' in data:
            settings_obj.auto_sync_enabled = data['auto_sync_enabled']
        if 'sync_on_create' in data:
            settings_obj.sync_on_create = data['sync_on_create']
        if 'sync_on_update' in data:
            settings_obj.sync_on_update = data['sync_on_update']
        if 'sync_on_delete' in data:
            settings_obj.sync_on_delete = data['sync_on_delete']
        
        settings_obj.save()
        
        return Response({
            "auto_sync_enabled": settings_obj.auto_sync_enabled,
            "sync_on_create": settings_obj.sync_on_create,
            "sync_on_update": settings_obj.sync_on_update,
            "sync_on_delete": settings_obj.sync_on_delete,
            "message": "Settings updated successfully"
        }, status=status.HTTP_200_OK)


def should_auto_sync():
    """
    Check if auto-sync is enabled globally.
    """
    from .models import CalendarSyncSettings
    
    try:
        settings_obj = CalendarSyncSettings.objects.first()
        return settings_obj and settings_obj.auto_sync_enabled
    except:
        return False
