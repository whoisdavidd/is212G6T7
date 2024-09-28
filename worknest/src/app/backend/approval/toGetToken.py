from flask import Flask, redirect, url_for, session, request
from flask_cors import CORS  # Import Flask-CORS
import google_auth_oauthlib.flow

app = Flask(__name__)
CORS(app)
app.secret_key = '12345678901'  # Replace with a secure key

# Define the scopes and redirect URI
SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']
flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    'credentials.json',
    scopes=SCOPES)
flow.redirect_uri = 'http://localhost:8080/oauth2callback'
@app.route('/')
def index():
    return 'Welcome to the Google OAuth 2.0 Example! <a href="/authorize">Authorize</a>'

@app.route('/authorize')
def authorize():
    # Generate the authorization URL
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        login_hint='jocelynyap0513@gmail.com',
        prompt='consent'
    )
    # Store the state in the session for later validation
    session['state'] = state
    return redirect(authorization_url)

@app.route('/oauth2callback')
def oauth2callback():
    # Handle the callback from Google's OAuth 2.0 server
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials
    session['credentials'] = credentials_to_dict(credentials)
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
