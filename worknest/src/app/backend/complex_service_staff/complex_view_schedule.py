from flask import Flask, request, jsonify
from flask_cors import CORS
from os import environ

import requests



app = Flask(__name__)
CORS(app)

event_url = environ.get("EVENT_URL") or "http://localhost:5001/event/public-holiday"
profile_url = environ.get("PROFILE_URL") or "http://localhost:5002/profile"
request_url = environ.get("REQUEST_URL") or "http://localhost:5003/request"

@app.route('/view-schedule', methods=['GET'])
def get_schedule():
    try:
        # Get public holiday events from the event microservice
        event_response = requests.get(event_url)
        if event_response.status_code == 200:
            event_data = event_response.json()
        else:
            return jsonify({"error": "Failed to fetch events"}), 500
        
        # Get profile information from the profile microservice
        profile_response = requests.get(profile_url)
        if profile_response.status_code == 200:
            profile_data = profile_response.json()
        else:
            return jsonify({"error": "Failed to fetch profiles"}), 500
        
        # Get request information (WFH requests) from the request microservice
        request_response = requests.get(request_url)
        if request_response.status_code == 200:
            request_data = request_response.json()
        else:
            return jsonify({"error": "Failed to fetch requests"}), 500

        # Create a complex view by merging data from all microservices
        complex_view = {
            "public_holidays": event_data,
            "profiles": profile_data,
            "requests": request_data
        }

        return jsonify(complex_view)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000, debug=True)  