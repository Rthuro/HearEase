import resend
from django.conf import settings
import threading
from android_sms_gateway import client, domain

resend.api_key = settings.RESEND_API_KEY 
login = settings.SMSGATE_USERNAME
password = settings.SMSGATE_PASSWORD
    
def send_otp_email(email, code):
    html_content = f"""
    <div style="font-family: sans-serif; text-align: center;">
        <h2>Verify your email</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 5px; color: #DC2626; font-size: 32px;">{code}</h1>
        <p>This code expires in 10 minutes.</p>
    </div>
    """

    resend.Emails.send({
        "from": "HearEase Support <noreply@hearease.me>",
        "to": email,
        "subject": f"{code} is your verification code",
        "html": html_content
    })

class EmailNotification:
    @staticmethod
    def send_hearing_reminder(user_email, user_name, hearing_date, case_number, user_obj):
        
        # 1. CHECK PREFERENCE
        # If the user has turned off email notifications, STOP.
        if hasattr(user_obj, 'notification_preferences'):
            if not user_obj.notification_preferences.allow_email:
                print(f"Skipped email for {user_email}: User disabled email notifications.")
                return 

        subject = f"Reminder: Hearing for Case #{case_number}"
        
        html_content = f""" ... html content ... """

        email_data = {
            "from": "HearEase <updates@hearease.me>",
            "to": user_email,
            "subject": subject,
            "html": html_content
        }
        
        EmailThread(email_data).start()
        
    def created_case_notification(user_email, user_name, case_number, case_status):
        subject = f"Case #{case_number} Created Successfully"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #DC2626;">Case Created</h2>
            <p>Hi {user_name},</p>
            <p>Your case has been created successfully.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Case Number:</strong> {case_number}</p>
                <p><strong>Status:</strong> {case_status}</p>
            </div>

            <a href="https://www.hearease.me/#/u/@{user_name}/Case/{case_number}" style="background-color: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                View Case
            </a>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
                © 2025 HearEase. Sent from hearease.me
            </p>
        </div>
        """

        # Send in a background thread so your website doesn't load slowly
        email_data = {
            "from": "HearEase Notifications <updates@hearease.me>",
            "to": user_email,
            "subject": subject,
            "html": html_content
        }

        EmailThread(email_data).start()

    def send_hearing_reminder(user_email, user_name, hearing_date, case_number):
        subject = f"Reminder: Hearing for Case #{case_number}"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #DC2626;">Hearing Reminder</h2>
            <p>Hi {user_name},</p>
            <p>This is a reminder that you have an upcoming hearing.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Case Number:</strong> {case_number}</p>
                <p><strong>Date:</strong> {hearing_date}</p>
                <p><strong>Venue:</strong> Barangay Hall of Tetuan</p>
            </div>

            <a href="https://www.hearease.me/#/u/@{user_name}" style="background-color: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                View Details
            </a>
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
                © 2025 HearEase. Sent from hearease.me
            </p>
        </div>
        """

        # Send in a background thread so your website doesn't load slowly
        email_data = {
            "from": "HearEase Notifications <updates@hearease.me>",
            "to": user_email,
            "subject": subject,
            "html": html_content
        }
        
        # This wrapper makes it async (fire and forget)
        EmailThread(email_data).start()

class EmailThread(threading.Thread):
    def __init__(self, email_data):
        self.email_data = email_data
        threading.Thread.__init__(self)

    def run(self):
        try:
            resend.Emails.send(self.email_data)
        except Exception as e:
            print(f"Failed to send email: {e}")

def send_otp_sms(contact_number, code):
    message_text = f"Your HearEase phone verification code is: {code}. It expires in 10 minutes."

    message = domain.Message(
        phone_numbers=[contact_number],
        text_message=domain.TextMessage(text=message_text)
    )

    try:
        with client.APIClient(login, password) as c:
            c.send(message)
            return True
    except Exception as e:
        print(f"SMS Error: {e}")
        return False