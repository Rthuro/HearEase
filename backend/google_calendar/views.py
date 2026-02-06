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
    
    GET /api/google-calendar/auth-url/?email=user@email.com&role=admin
    """
    def get(self, request):
        # Get user email and role from query params
        user_email = request.query_params.get('email', '')
        user_role = request.query_params.get('role', 'user')
        
        auth_url, state = get_authorization_url()
        
        # Store state with user info in session for verification
        request.session['google_oauth_state'] = state
        request.session['google_oauth_user_email'] = user_email
        request.session['google_oauth_user_role'] = user_role
        
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
        
        # Get user info from session
        user_email = request.session.get('google_oauth_user_email', '')
        user_role = request.session.get('google_oauth_user_role', 'user')
        
        print(f"[Google OAuth] Callback - email: {user_email}, role: {user_role}")
        
        # Determine redirect URL based on role
        frontend_base = "http://localhost:5173/#"
        if user_role == 'admin':
            settings_url = f"{frontend_base}/Admin/Settings"
        elif user_role == 'lupon':
            settings_url = f"{frontend_base}/Lupon/Settings"
        else:
            # Regular user - need their user link name, fallback to generic
            settings_url = f"{frontend_base}/u/Settings"
        
        if error:
            return redirect(f"{settings_url}?google_error={error}")
        
        if not code:
            return Response(
                {"error": "No authorization code provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Exchange code for tokens
            print("[Google OAuth] Exchanging code for tokens...")
            tokens = exchange_code_for_tokens(code)
            print(f"[Google OAuth] Tokens received")
            
            # Find user by email (works for all user types)
            user = None
            if user_email:
                user = User.objects.filter(email=user_email).first()
            
            if not user:
                # Fallback to first admin if no specific user
                user = User.objects.filter(is_admin=True).first()
                if not user:
                    user = User.objects.filter(is_superadmin=True).first()
            
            print(f"[Google OAuth] User: {user.email if user else 'None'}")
            
            if not user:
                return redirect(f"{settings_url}?google_error=no_user_found")
            
            # Get calendar service and create/get calendar
            print("[Google OAuth] Creating calendar service...")
            service, credentials = get_calendar_service(tokens)
            print("[Google OAuth] Getting/creating HearEase calendar...")
            calendar_id = create_or_get_hearease_calendar(service)
            print(f"[Google OAuth] Calendar ID: {calendar_id}")
            
            # Update token expiry with actual value
            token_expiry = credentials.expiry if credentials.expiry else datetime.utcnow()
            
            # Save tokens for this specific user
            GoogleCalendarToken.objects.update_or_create(
                user=user,
                defaults={
                    "access_token": tokens["access_token"],
                    "refresh_token": tokens["refresh_token"],
                    "token_expiry": token_expiry,
                    "calendar_id": calendar_id
                }
            )
            print(f"[Google OAuth] Token saved for {user.email}!")
            
            # Clear session
            if 'google_oauth_user_email' in request.session:
                del request.session['google_oauth_user_email']
            if 'google_oauth_user_role' in request.session:
                del request.session['google_oauth_user_role']
            
            return redirect(f"{settings_url}?google_connected=true")
            
        except Exception as e:
            import traceback
            print(f"[Google OAuth] ERROR: {e}")
            print(traceback.format_exc())
            return redirect(f"{settings_url}?google_error={str(e)[:50]}")


class GoogleConnectionStatusView(APIView):
    """
    Check if Google Calendar is connected for a specific user.
    
    GET /api/google-calendar/status/?email=user@email.com
    """
    def get(self, request):
        user_email = request.query_params.get('email', '')
        
        if user_email:
            # Check for specific user's token
            user = User.objects.filter(email=user_email).first()
            if user:
                token = GoogleCalendarToken.objects.filter(user=user).first()
            else:
                token = None
        else:
            # Fallback: check any connected token
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
    Disconnect Google Calendar for a specific user.
    
    POST /api/google-calendar/disconnect/
    { "email": "user@email.com" }
    """
    def post(self, request):
        user_email = request.data.get('email', '')
        
        if user_email:
            # Disconnect specific user's token
            user = User.objects.filter(email=user_email).first()
            if user:
                deleted_count, _ = GoogleCalendarToken.objects.filter(user=user).delete()
            else:
                deleted_count = 0
        else:
            # Fallback: delete all tokens (admin action)
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
            }, token_obj=token)
            
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
            error_str = str(e)
            print(f"[Sync] FATAL ERROR: {error_str}")
            print(traceback.format_exc())
            
            # Check if this was a token revocation issue
            if "TOKEN_REVOKED" in error_str:
                return Response({
                    "error": "Your Google Calendar connection has expired. Please reconnect.",
                    "token_revoked": True
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response(
                {"error": error_str},
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
        }, token_obj=token)
        
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
