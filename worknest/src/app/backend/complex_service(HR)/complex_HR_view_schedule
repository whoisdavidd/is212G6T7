from flask import Flask, request, jsonify
from flask_cors import CORS
from os import environ

import requests



app = Flask(__name__)
CORS(app)

schedule_url = environ.get('schedule_url') or "http://localhost:5004/schedule"

@app.route("/HR_view_schedule", methods=['GET'])
def HR_view_schedule():
    # Get the schedule from the schedule service
    response = requests.get(schedule_url)
    schedule = response.json()

    return jsonify(schedule), 200

if __name__ == '__main__':
    app.run(debug=True)