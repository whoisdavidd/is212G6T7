from flask import Flask, redirect, url_for, session, request
import google_auth_oauthlib.flow
import os
import json  # Import json module for saving credentials

# Allow insecure transport (not recommended for production)
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

app = Flask(__name__)
app.secret_key = 'SECRET KEY'  # Replace with a secure key

# Define the scopes and flow
SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/gmail.send']
flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    'credentials.json',
    scopes=SCOPES)
flow.redirect_uri = 'http://localhost:8080/oauth2callback'  # Update to your actual redirect URI

@app.route('/')
def index():
    return 'Welcome! <a href="/authorize">Authorize</a>'

@app.route('/authorize')
def authorize():
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    session['state'] = state
    return redirect(authorization_url)

@app.route('/oauth2callback')
def oauth2callback():
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials
    session['credentials'] = credentials_to_dict(credentials)
    
    # Save the credentials to a file
    with open('token.json', 'w') as token_file:
        json.dump(credentials_to_dict(credentials), token_file)

    return 'You have successfully authorized the application!'

def credentials_to_dict(credentials):
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

if __name__ == '__main__':
    app.run(port=8080)
