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


def get_calendar_service(token_data, token_obj=None):
    """
    Build Google Calendar API service from stored tokens.
    Automatically refreshes token if expired.
    
    Args:
        token_data: Dict with access_token and refresh_token
        token_obj: Optional GoogleCalendarToken model instance to delete on failure
    """
    from google.auth.transport.requests import Request
    
    credentials = Credentials(
        token=token_data["access_token"],
        refresh_token=token_data["refresh_token"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
        scopes=SCOPES
    )
    
    # Check if token is expired and refresh if necessary
    if credentials.expired or not credentials.valid:
        try:
            print("[Calendar Service] Token expired, attempting refresh...")
            credentials.refresh(Request())
            print("[Calendar Service] Token refreshed successfully")
        except Exception as e:
            error_str = str(e).lower()
            print(f"[Calendar Service] Token refresh failed: {e}")
            
            # If invalid_grant (token revoked), delete the stored token
            if "invalid_grant" in error_str or "token has been expired or revoked" in error_str:
                if token_obj:
                    print(f"[Calendar Service] Deleting invalid token for user {token_obj.user.email}")
                    token_obj.delete()
                raise Exception("TOKEN_REVOKED: Your Google Calendar connection has expired. Please reconnect.")
            
            # Token is revoked or invalid - need to re-authenticate
            raise Exception(f"Token expired or revoked. Please reconnect Google Calendar. Error: {e}")
    
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


# Philippine Holidays Calendar ID (Google's public calendar)
PHILIPPINE_HOLIDAYS_CALENDAR_ID = "en.philippines#holiday@group.v.calendar.google.com"


def get_philippine_holidays(start_date, end_date, api_key=None):
    """
    Get Philippine holidays for a given date range.
    Uses hardcoded official Philippine holidays for reliability.
    
    Args:
        start_date: Start date (datetime.date or datetime)
        end_date: End date (datetime.date or datetime)
        api_key: Not used (kept for compatibility)
    
    Returns:
        List of holidays: [{date, name, description, is_public}]
    """
    import datetime as dt
    
    # Convert to date objects if needed
    if hasattr(start_date, 'date'):
        start_date = start_date.date()
    if hasattr(end_date, 'date'):
        end_date = end_date.date()
    
    # Official Philippine holidays (regular and special non-working)
    # Year-agnostic - will be applied to the requested year range
    PHILIPPINE_HOLIDAYS = [
        # Regular Holidays
        {"month": 1, "day": 1, "name": "New Year's Day", "type": "regular"},
        {"month": 4, "day": 9, "name": "Araw ng Kagitingan (Day of Valor)", "type": "regular"},
        {"month": 5, "day": 1, "name": "Labor Day", "type": "regular"},
        {"month": 6, "day": 12, "name": "Independence Day", "type": "regular"},
        {"month": 8, "day": 21, "name": "Ninoy Aquino Day", "type": "regular"},
        {"month": 8, "day": 26, "name": "National Heroes Day", "type": "regular"},  # Last Monday of August, simplified
        {"month": 11, "day": 30, "name": "Bonifacio Day", "type": "regular"},
        {"month": 12, "day": 25, "name": "Christmas Day", "type": "regular"},
        {"month": 12, "day": 30, "name": "Rizal Day", "type": "regular"},
        
        # Special Non-Working Holidays
        {"month": 1, "day": 2, "name": "Additional Special Non-Working Day", "type": "special"},
        {"month": 2, "day": 25, "name": "EDSA People Power Revolution Anniversary", "type": "special"},
        {"month": 8, "day": 21, "name": "Ninoy Aquino Day", "type": "special"},
        {"month": 11, "day": 1, "name": "All Saints' Day", "type": "special"},
        {"month": 11, "day": 2, "name": "All Souls' Day", "type": "special"},
        {"month": 12, "day": 8, "name": "Feast of the Immaculate Conception", "type": "special"},
        {"month": 12, "day": 24, "name": "Christmas Eve", "type": "special"},
        {"month": 12, "day": 31, "name": "New Year's Eve", "type": "special"},
        
        # Variable holidays (approximate dates for 2026)
        # Holy Week - typically in March/April
        {"month": 4, "day": 2, "name": "Maundy Thursday", "type": "regular"},
        {"month": 4, "day": 3, "name": "Good Friday", "type": "regular"},
        {"month": 4, "day": 4, "name": "Black Saturday", "type": "special"},
        
        # Chinese New Year (approximate)
        {"month": 2, "day": 17, "name": "Chinese New Year", "type": "special"},
        
        # Eid'l Fitr (approximate - varies by year)
        {"month": 3, "day": 31, "name": "Eid'l Fitr (Feast of Ramadan)", "type": "regular"},
        
        # Eid'l Adha (approximate - varies by year)
        {"month": 6, "day": 7, "name": "Eid'l Adha (Feast of Sacrifice)", "type": "regular"},
    ]
    
    holidays = []
    
    # Iterate through each year in the range
    start_year = start_date.year
    end_year = end_date.year
    
    for year in range(start_year, end_year + 1):
        for holiday in PHILIPPINE_HOLIDAYS:
            try:
                holiday_date = dt.date(year, holiday["month"], holiday["day"])
                
                # Check if holiday falls within the date range
                if start_date <= holiday_date <= end_date:
                    holidays.append({
                        "date": holiday_date.isoformat(),
                        "name": holiday["name"],
                        "description": f"{holiday['type'].title()} Holiday",
                        "type": holiday["type"],
                        "is_public": True
                    })
            except ValueError:
                # Invalid date (e.g., Feb 30), skip
                continue
    
    # Sort by date
    holidays.sort(key=lambda x: x["date"])
    
    return holidays


def get_holidays_for_calendar(year=None, month=None, include_next_month=False):
    """
    Get holidays for display in the HearEase calendar.
    
    Args:
        year: Year (defaults to current)
        month: Month (defaults to current)
        include_next_month: If True, also fetch next month (for last week display)
    
    Returns:
        List of holidays
    """
    import datetime as dt
    import calendar
    
    now = dt.datetime.now()
    year = year or now.year
    month = month or now.month
    
    # Get first and last day of month
    _, last_day = calendar.monthrange(year, month)
    start_date = dt.date(year, month, 1)
    end_date = dt.date(year, month, last_day)
    
    # If include_next_month, extend end_date
    if include_next_month:
        if month == 12:
            next_month = 1
            next_year = year + 1
        else:
            next_month = month + 1
            next_year = year
        
        _, next_last_day = calendar.monthrange(next_year, next_month)
        end_date = dt.date(next_year, next_month, next_last_day)
    
    return get_philippine_holidays(start_date, end_date)

