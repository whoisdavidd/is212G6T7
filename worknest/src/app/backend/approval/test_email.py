import os
import base64
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from email.mime.text import MIMEText

# Gmail API scope to send emails
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def gmail_authenticate():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
    
    return creds

def create_message(sender, to, subject, message_text):
    message = MIMEText(message_text)
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    return {'raw': base64.urlsafe_b64encode(message.as_bytes()).decode()}

def send_message(service, sender, to, subject, body):
    message = create_message(sender, to, subject, body)
    try:
        message_sent = service.users().messages().send(userId="me", body=message).execute()
        print(f"Message sent. ID: {message_sent['id']}")
    except Exception as error:
        print(f"An error occurred: {error}")

def main():
    creds = gmail_authenticate()
    service = build('gmail', 'v1', credentials=creds)

    sender_email = "jocelyn.yap.2022@scis.smu.edu.sg"
    recipient_email = "jocelynyap0513@gmail.com"
    subject = "Test Email"
    body = "This is a test email sent from the Gmail API."

    send_message(service, sender_email, recipient_email, subject, body)

if __name__ == '__main__':
    main()

