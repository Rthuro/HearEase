"""
Google Calendar Service
Handles OAuth2 flow and calendar operations.
"""
import os
from datetime import datetime, timedelta
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.conf import settings


# Scopes required for calendar access
SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
]


def get_oauth_flow(redirect_uri=None):
    """
    Create OAuth2 flow for Google Calendar authorization.
    """
    client_config = {
        "web": {
            "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
            "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [os.environ.get("GOOGLE_REDIRECT_URI", redirect_uri)],
        }
    }
    
    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=redirect_uri or os.environ.get("GOOGLE_REDIRECT_URI")
    )
    return flow


def get_authorization_url():
    """
    Generate the Google OAuth2 authorization URL.
    """
    flow = get_oauth_flow()
    auth_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    return auth_url, state


def exchange_code_for_tokens(code):
    """
    Exchange authorization code for access and refresh tokens.
    """
    flow = get_oauth_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    # Handle token expiry properly
    if credentials.expiry:
        token_expiry = credentials.expiry
    else:
        token_expiry = datetime.utcnow() + timedelta(hours=1)
    
    return {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_expiry": token_expiry
    }


def get_calendar_service(token_data):
    """
    Build Google Calendar API service from stored tokens.
    """
    credentials = Credentials(
        token=token_data["access_token"],
        refresh_token=token_data["refresh_token"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
        scopes=SCOPES
    )
    
    service = build('calendar', 'v3', credentials=credentials)
    return service, credentials


def create_or_get_hearease_calendar(service):
    """
    Create a dedicated HearEase calendar or get existing one.
    """
    calendar_name = "HearEase Hearings"
    
    # Check if calendar already exists
    calendars = service.calendarList().list().execute()
    for cal in calendars.get('items', []):
        if cal.get('summary') == calendar_name:
            return cal['id']
    
    # Create new calendar
    calendar_body = {
        'summary': calendar_name,
        'description': 'Barangay Hearing Schedules from HearEase System',
        'timeZone': 'Asia/Manila'
    }
    
    created_calendar = service.calendars().insert(body=calendar_body).execute()
    return created_calendar['id']


def create_hearing_event(service, calendar_id, hearing):
    """
    Create a Google Calendar event for a hearing.
    """
    # Build event description
    case_info = f"Case #{hearing.case.id}" if hearing.case else "Unknown Case"
    case_type = hearing.case.case_type.case_name if hearing.case and hearing.case.case_type else "Unknown Type"
    lupon_name = f"{hearing.lupon_member.first_name} {hearing.lupon_member.last_name}" if hearing.lupon_member else "Unassigned"
    
    # Determine time
    if hearing.hearing_date and hearing.time:
        start_datetime = datetime.combine(hearing.hearing_date, hearing.time)
        end_datetime = start_datetime + timedelta(hours=1)  # 1 hour duration
        
        event = {
            'summary': f"📋 Hearing #{hearing.hearing_number} - {case_type}",
            'description': f"""
HearEase Hearing Details
━━━━━━━━━━━━━━━━━━━━
Case: {case_info}
Type: {case_type}
Hearing Number: {hearing.hearing_number}
Status: {hearing.get_hearing_status_display()}
Assigned Lupon: {lupon_name}
Remarks: {hearing.remarks or 'None'}
━━━━━━━━━━━━━━━━━━━━
Auto-synced from HearEase System
            """.strip(),
            'start': {
                'dateTime': start_datetime.isoformat(),
                'timeZone': 'Asia/Manila',
            },
            'end': {
                'dateTime': end_datetime.isoformat(),
                'timeZone': 'Asia/Manila',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 60},
                    {'method': 'popup', 'minutes': 1440},  # 1 day before
                ],
            },
        }
    else:
        # All-day event if no time specified
        event = {
            'summary': f"📋 Hearing #{hearing.hearing_number} - {case_type}",
            'description': f"Case: {case_info}\nAssigned: {lupon_name}",
            'start': {
                'date': hearing.hearing_date.isoformat(),
                'timeZone': 'Asia/Manila',
            },
            'end': {
                'date': hearing.hearing_date.isoformat(),
                'timeZone': 'Asia/Manila',
            },
        }
    
    try:
        created_event = service.events().insert(
            calendarId=calendar_id,
            body=event
        ).execute()
        return created_event['id']
    except HttpError as e:
        print(f"Error creating event: {e}")
        raise


def update_hearing_event(service, calendar_id, event_id, hearing):
    """
    Update an existing Google Calendar event.
    """
    case_info = f"Case #{hearing.case.id}" if hearing.case else "Unknown Case"
    case_type = hearing.case.case_type.case_name if hearing.case and hearing.case.case_type else "Unknown Type"
    lupon_name = f"{hearing.lupon_member.first_name} {hearing.lupon_member.last_name}" if hearing.lupon_member else "Unassigned"
    
    status_emoji = "✅" if hearing.hearing_status == "completed" else "📋"
    
    if hearing.hearing_date and hearing.time:
        start_datetime = datetime.combine(hearing.hearing_date, hearing.time)
        end_datetime = start_datetime + timedelta(hours=1)
        
        event = {
            'summary': f"{status_emoji} Hearing #{hearing.hearing_number} - {case_type}",
            'description': f"""
HearEase Hearing Details
━━━━━━━━━━━━━━━━━━━━
Case: {case_info}
Type: {case_type}
Hearing Number: {hearing.hearing_number}
Status: {hearing.get_hearing_status_display()}
Assigned Lupon: {lupon_name}
Remarks: {hearing.remarks or 'None'}
━━━━━━━━━━━━━━━━━━━━
Auto-synced from HearEase System
            """.strip(),
            'start': {
                'dateTime': start_datetime.isoformat(),
                'timeZone': 'Asia/Manila',
            },
            'end': {
                'dateTime': end_datetime.isoformat(),
                'timeZone': 'Asia/Manila',
            },
        }
    else:
        event = {
            'summary': f"{status_emoji} Hearing #{hearing.hearing_number} - {case_type}",
            'start': {'date': hearing.hearing_date.isoformat(), 'timeZone': 'Asia/Manila'},
            'end': {'date': hearing.hearing_date.isoformat(), 'timeZone': 'Asia/Manila'},
        }
    
    try:
        updated_event = service.events().update(
            calendarId=calendar_id,
            eventId=event_id,
            body=event
        ).execute()
        return updated_event['id']
    except HttpError as e:
        print(f"Error updating event: {e}")
        raise


def delete_hearing_event(service, calendar_id, event_id):
    """
    Delete a Google Calendar event.
    """
    try:
        service.events().delete(
            calendarId=calendar_id,
            eventId=event_id
        ).execute()
        return True
    except HttpError as e:
        print(f"Error deleting event: {e}")
        raise
