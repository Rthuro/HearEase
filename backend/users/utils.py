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
    def custom_email(user_email, subject, body):
    # Professional colors
        primary_red = "#DC2626"
        bg_color = "#F9FAFB"
        text_color = "#1F2937"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: {bg_color}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: {bg_color}; padding: 40px 20px;">
                <tr>
                    <td align="center">
                        <!-- Main Card -->
                        <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e5e7eb;">
                            
                            <!-- Header -->
                            <tr>
                                <td style="background-color: {primary_red}; padding: 30px; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px; font-weight: 800;">HearEase</h1>
                                </td>
                            </tr>

                            <!-- Content Area -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: {text_color}; margin-top: 0; font-size: 20px; font-weight: 700;">{subject}</h2>
                                    <p style="color: #4B5563; line-height: 1.6; font-size: 16px; margin-bottom: 30px;">
                                        {body}
                                    </p>
                                    
                                    <!-- Action Button (Optional) -->
                                    <table border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                                        <tr>
                                            <td align="center" bgcolor="{primary_red}" style="border-radius: 6px;">
                                                <a href="https://www.hearease.me" target="_blank" style="padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: 600; display: inline-block;">Visit our website</a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Footer Info -->
                            <tr>
                                <td style="padding: 20px 30px; background-color: #F3F4F6; border-top: 1px solid #e5e7eb; text-align: center;">
                                    <p style="font-size: 12px; color: #9CA3AF; margin-top: 10px;">
                                        &copy; 2026 HearEase. All rights reserved.<br>
                                        Sent from <a href="https://hearease.me" style="color: #9CA3AF; text-decoration: underline;">hearease.me</a>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        email_data = {
            "from": "HearEase Notifications <updates@hearease.me>",
            "to": user_email,
            "subject": f"HearEase: {subject}",
            "html": html_content
        }

        EmailThread(email_data).start() 
    def created_case_notification(user_email, name, case_number, case_status):
        subject = f"{case_number} Created Successfully"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #DC2626;">Case Created</h2>
            <p>Hi {name},</p>
            <p>You are receiving this notification because a new case has been created under your name. Please wait for further updates. The HearEase admin will process the case shortly.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Case Number:</strong> {case_number}</p>
                <p><strong>Status:</strong> {case_status}</p>
            </div>

            <a href="https://www.hearease.me/#/u/@{user_email.split('@')[0]}/Case/{case_number}" style="background-color: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
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
    def case_status_update_notification(user_email, name, case_number, case_status, remarks ='No remarks provided'):
        subject = ''
        body = ''

        if case_status == 'approved':
            subject = f"Your {case_number} has been Approved"
            body = f"Congratulations! Your case: {case_number} has been approved. The hearing will be scheduled once the summon is served. Please wait for further updates."
        elif case_status == 'rejected':
            subject = f"Your {case_number} has been Rejected"
            body = f"Unfortunately, your case: {case_number} has been rejected."
        elif case_status == 'in_progress':
            subject = f"Your {case_number} is now In Progress"
            body = f"Your case: {case_number} is now in progress. The hearing is already been scheduled. Please coordinate with the HearEase admin for questions or concerns."
        elif case_status == 'resolved':
            subject = f"Your {case_number} has been Resolved"
            body = f"Good news! Your case: {case_number} has been resolved. Thank you for using HearEase."
        elif case_status == 'escalated':
            subject = f"Your {case_number} has been Escalated"
            body = f"Your case: {case_number} has been escalated to a higher authority for further review. Please coordinate with the HearEase admin for questions or concerns."
        elif case_status == 'archived':
            subject = f"Your {case_number} has been Archived"
            body = f"Your case: {case_number} has been archived. You can still view the details of your case in your account."
        else:
            subject = f"Update on your {case_number}"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #DC2626;">Case Status Update</h2>
            <p>Hi {name},</p>
            <p>{body}</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Case Number:</strong> {case_number}</p>
                <p><strong>Status:</strong> {case_status}</p>
                <p><strong>Remarks:</strong> {remarks}</p>
            </div>

            <a href="https://www.hearease.me/#/u/@{user_email.split('@')[0]}/Case/{case_number}" style="background-color: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
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

class PhoneNotification:
    @staticmethod
    def custom_sms(contact_number, message):
        message_text = message

        message = domain.Message(
            phone_numbers=[contact_number],
            text_message=domain.TextMessage(text=message_text)
        )

        try:
            with client.APIClient(login, password) as c:
                c.send(message)
        except Exception as e:
            print(f"SMS Error: {e}")
    def created_case_notification(user_email, contact_number, name, case_number, case_status):
        message_text = (
            f"Hello {name}, You are receiving this notification because a new case has been created under your name. Please wait for further updates. The HearEase admin will process the case shortly. "
            f"Case Number: {case_number}, Status: {case_status}."
            f" View your case at: https://www.hearease.me/#/u/@{user_email}/Case/{case_number}"
        )

        message = domain.Message(
            phone_numbers=[contact_number],
            text_message=domain.TextMessage(text=message_text)
        )

        try:
            with client.APIClient(login, password) as c:
                c.send(message)
        except Exception as e:
            print(f"SMS Error: {e}")
    def case_status_update_notification(user_email, contact_number, name, case_number, case_status, remarks ='No remarks provided'):
        body = ''
        if case_status == 'approved':
            body = f"Congratulations! Your case: {case_number} has been approved. The hearing will be scheduled once the summon is served. Please wait for further updates."
        elif case_status == 'rejected':
            body = f"Unfortunately, your case: {case_number} has been rejected."
        elif case_status == 'in_progress':
            body = f"Your case: {case_number} is now in progress. The hearing is already been scheduled. Please coordinate with the HearEase admin for questions or concerns."
        elif case_status == 'resolved':
            body = f"Good news! Your case: {case_number} has been resolved. Thank you for using HearEase."
        elif case_status == 'escalated':
            body = f"Your case: {case_number} has been escalated to a higher authority for further review. Please coordinate with the HearEase admin for questions or concerns."
        elif case_status == 'archived':
            body = f"Your case: {case_number} has been archived. You can still view the details of your case in your account."
        else:
            body = f"Update on your case: {case_number}."

        message_text = (
            f"Hello {name}, {body} "
            f"Case Number: {case_number}, Status: {case_status}, Remarks: {remarks}."
            f" View your case at: https://www.hearease.me/#/u/@{user_email}/Case/{case_number}"
        )

        message = domain.Message(
            phone_numbers=[contact_number],
            text_message=domain.TextMessage(text=message_text)
        )

        try:
            with client.APIClient(login, password) as c:
                c.send(message)
        except Exception as e:
            print(f"SMS Error: {e}")

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