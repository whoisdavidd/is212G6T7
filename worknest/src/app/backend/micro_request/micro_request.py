from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests

load_dotenv()

db_url = os.getenv("DATABASE_URL")

app = Flask(__name__)

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Request(db.Model):
    __tablename__ = "request"
    staff_id = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    reporting_manager_id = db.Column(db.Integer)
    reporting_manager_name = db.Column(db.String(50))
    day_id = db.Column(db.Integer)
    recurring_days = db.Column(db.Integer)
    
    def __init__(self, staff_id, department, start_date, reason, duration, status, reporting_manager_id, reporting_manager_name, day_id, recurring_days):
        self.staff_id = staff_id
        self.department = department
        self.start_date = start_date
        self.reason = reason
        self.duration = duration
        self.status = status
        self.reporting_manager_id = reporting_manager_id
        self.reporting_manager_name = reporting_manager_name
        self.day_id = day_id
        self.recurring_days = recurring_days
        
    def to_dict(self):
        return {
            'staff_id': self.staff_id,
            'department': self.department,
            'start_date': self.start_date,
            'reason': self.reason,
            'duration': self.duration,
            'status': self.status, #need datetime? for audit log
            'reporting_manager_id': self.reporting_manager_id,
            'reporting_manager_name': self.reporting_manager_name,
            'day_id': self.day_id,
            'recurring_days': self.recurring_days
        }

@app.route('/request', methods=['GET'])
def get_all_requests():
    requests = Request.query.all()
    return jsonify([request.to_dict() for request in requests])

@app.route('/add_request/<int:staff_id>', methods=['POST'])
def add_request(staff_id):
    data = request.get_json()
    new_request = Request(staff_id=staff_id, department=data['department'], start_date=data['start_date'], reason=data['reason'], duration=data['duration'], status=data['status'], reporting_manager_id=data['reporting_manager_id'], reporting_manager_name=data['reporting_manager_name'])
    db.session.add(new_request)
    db.session.commit()
    return jsonify(new_request.to_dict())

def approve_request(request_id):
    # Approve the request (you may already have this logic in place)
    request = Request.query.get(request_id)
    if request:
        request.status = 'approved'
        db.session.commit()

        # Notify the Schedule microservice
        schedule_update_url = "http://localhost:5004/schedule/update"  # URL of Schedule microservice

        # Send a POST request to the Schedule microservice
        profile_data = {
            'staff_id': request.staff_id,
            'start_date': request.start_date,
            'department': request.department,
            'status': request.status
        }
        try:
            response = requests.post(schedule_update_url, json=profile_data)
            if response.status_code != 200:
                print(f"Failed to update Schedule: {response.text}")
        except Exception as e:
            print(f"Error notifying Schedule microservice: {e}")

@app.route('/request/withdraw/<int:staff_id>', methods=['POST'])
def withdraw_request(staff_id):
    # Check if user is logged in
    if 'staff_id' not in session or 'role' not in session:
        return jsonify({'message': 'Unauthorized access'}), 401

    current_staff_id = session['staff_id']
    current_role = session['role']  # Assuming role '1' is Manager/Director, '2' is Staff

    # Authorization: Staff can withdraw their own requests; Managers can withdraw any
    if current_role == 2 and staff_id != current_staff_id:
        return jsonify({'message': 'Unauthorized to withdraw this request'}), 403

    # Fetch the request using staff_id
    request_obj = Request.query.filter_by(staff_id=staff_id).first()
    if not request_obj:
        return jsonify({'message': 'Request not found'}), 404

    # Check if the request is already withdrawn
    if request_obj.status.lower() == 'withdrawn':
        return jsonify({'message': 'Request is already withdrawn'}), 400

    # Proceed to withdraw the request
    request_obj.status = 'Withdrawn'
    db.session.commit()

    # Communicate with the Schedule microservice to revert the schedule
    schedule_update_url = "http://localhost:5004/schedule/update"  # Update if different

    profile_update_data = {
        'staff_id': request_obj.staff_id,
        'start_date': request_obj.start_date,
        'department': request_obj.department,
        'status': request_obj.status
    }

    try:
        response = requests.post(schedule_update_url, json=profile_update_data)
        if response.status_code != 200:
            # Log the error or handle it as needed
            return jsonify({'message': 'Request withdrawn, but failed to update schedule'}), 500
    except Exception as e:
        # Log the exception
        return jsonify({'message': 'Request withdrawn, but an error occurred while updating schedule', 'error': str(e)}), 500

    return jsonify({'message': 'Request withdrawn successfully'}), 200

if __name__ == '__main__':
    app.run(port=5003, debug=True)