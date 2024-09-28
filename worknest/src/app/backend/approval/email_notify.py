# send email using gmail api 
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request  
from googleapiclient.discovery import build
import base64
import os

# If modifying these SCOPES, delete the token.json file.
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def gmail_authenticate():
    creds = None
    # The file token.json stores the user's access and refresh tokens
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If no valid credentials are available, raise an error
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)  # This line will only run locally

            # Save the credentials for the next run
            with open('token.json', 'w') as token:
                token.write(creds.to_json())

    return creds

def send_email_notification(to_email, subject, message_body):
    creds = gmail_authenticate()
    service = build('gmail', 'v1', credentials=creds)

    message = create_message(to_email, subject, message_body)
    service.users().messages().send(userId="me", body=message).execute()

def create_message(to_email, subject, message_body):
    message = f"To: {to_email}\nSubject: {subject}\n\n{message_body}"
    raw = base64.urlsafe_b64encode(message.encode('utf-8')).decode('utf-8')
    return {'raw': raw}