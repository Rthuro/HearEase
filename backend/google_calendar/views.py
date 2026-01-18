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
            
            synced = 0
            errors = []
            
            for hearing in hearings:
                try:
                    if hearing.google_event_id:
                        # Update existing
                        update_hearing_event(
                            service, token.calendar_id, 
                            hearing.google_event_id, hearing
                        )
                    else:
                        # Create new
                        event_id = create_hearing_event(
                            service, token.calendar_id, hearing
                        )
                        hearing.google_event_id = event_id
                        hearing.save(update_fields=['google_event_id'])
                    
                    synced += 1
                    
                    CalendarSyncLog.objects.create(
                        hearing=hearing,
                        action="create" if not hearing.google_event_id else "update",
                        google_event_id=hearing.google_event_id,
                        message="Synced successfully"
                    )
                    
                except Exception as e:
                    errors.append(f"Hearing #{hearing.id}: {str(e)}")
                    CalendarSyncLog.objects.create(
                        hearing=hearing,
                        action="error",
                        message=str(e)
                    )
            
            return Response({
                "synced": synced,
                "total": hearings.count(),
                "errors": errors if errors else None
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def sync_hearing_to_google(hearing, action="create"):
    """
    Helper function to sync a single hearing.
    Called from hearing views on create/update/delete.
    """
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
