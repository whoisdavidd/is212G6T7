from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests

load_dotenv()

db_url = os.getenv("SQLALCHEMY_DATABASE_URI")

app = Flask(__name__)
app.secret_key = 'supersecretkey' 

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  # Replace with your frontend's URL

app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI='postgresql://postgres:Worknest1234!@worknest.cr0a4u0u8ytj.ap-southeast-1.rds.amazonaws.com:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Set the secret key to a unique, unpredictable value
app.secret_key = os.getenv('SECRET_KEY')  # Replace with a secure key

# Alternatively, use environment variables for better security
# app.secret_key = os.getenv('SECRET_KEY', 'default_secret_key')

db = SQLAlchemy(app)
# db =SQLAlchemy(app)


class RequestModel(db.Model):
    __tablename__ = "request"
    request_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
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
            'request_id': self.request_id,
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
    



# ---------------------------------- Get All Requests ----------------------------------

@app.route('/request', methods=['GET'])
def get_all_requests():
    requests = RequestModel.query.all()
    return jsonify([request.to_dict() for request in requests])




# ---------------------------------- Add Request ----------------------------------

@app.route('/add_request/<int:staff_id>', methods=['POST'])
def add_request(staff_id):
    data = request.get_json()
    new_request = RequestModel(
        staff_id=staff_id,
        department=data['department'],
        start_date=data['start_date'],
        reason=data['reason'],
        duration=data['duration'],
        status=data['status'],
        reporting_manager_id=data['reporting_manager_id'],
        reporting_manager_name=data['reporting_manager_name'],
        day_id=data.get('day_id'),  # Use `get` to avoid KeyError if missing
        recurring_days=data.get('recurring_days')  # Use `get` for optional fields
    )
    db.session.add(new_request)
    db.session.commit()
    return jsonify(new_request.to_dict()), 201


def approve_request(request_id):
    # Approve the request (you may already have this logic in place)
    request = RequestModel.query.get(request_id)
    if request:
        request.status = 'Approved'
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




# ---------------------------------- Withdraw Request ----------------------------------

@app.route('/request/withdraw/<int:request_id>', methods=['PUT'])
def withdraw_request(request_id):
    # Retrieve custom headers
    role = request.headers.get('X-Role')
    client_staff_id = request.headers.get('X-Staff-ID')
    manager_department = request.headers.get('X-Department')

    # Debugging: Print retrieved headers
    print(f"Role: {role}, Client Staff ID: {client_staff_id}, Manager Department: {manager_department}")

    # Validate the presence of necessary headers
    if not role or not client_staff_id or not manager_department:
        return jsonify({'message': 'Missing authentication headers.'}), 400

    # Convert role and client_staff_id to integers
    try:
        role = int(role)
        client_staff_id = int(client_staff_id)
    except ValueError:
        return jsonify({'message': 'Invalid data types for role or staff ID.'}), 400

    # Authorization Logic:
    # Role 1: Manager can withdraw any request within their department
    # Role 2: Staff can only withdraw their own requests
    if role == 2:
        # Staff attempting to withdraw their own request
        request_obj = RequestModel.query.filter_by(
            request_id=request_id, staff_id=client_staff_id, status='pending'
        ).first()
        if not request_obj:
            return jsonify({'message': 'Unauthorized to withdraw this request or request already processed.'}), 403
    elif role == 1:
        # Manager attempting to withdraw a request within their department
        request_obj = RequestModel.query.filter_by(
            request_id=request_id, status='pending', department=manager_department
        ).first()
        if not request_obj:
            return jsonify({'message': 'Request not found, already processed, or not within your department.'}), 404
    else:
        return jsonify({'message': 'Invalid role.'}), 400

    # Proceed to withdraw the request
    request_obj.status = 'Withdrawn'
    db.session.commit()

    # Debugging: Print updated request object
    print(f"Updated Request: {request_obj.to_dict()}")

    # Communicate with the Schedule microservice to revert the schedule
    schedule_update_url = "http://localhost:5004/schedule/update"  # Update if different
    schedule_update_data = {
        'staff_id': request_obj.staff_id,
        'date': request_obj.start_date.isoformat(),
        'department': request_obj.department,
        'status': request_obj.status
    }

    try:
        response = requests.post(schedule_update_url, json=schedule_update_data)
        if response.status_code != 200:
            # Log the error or handle it as needed
            print(f"Schedule microservice responded with status code {response.status_code}")
            return jsonify({'message': 'Request withdrawn, but failed to update schedule.'}), 500
    except Exception as e:
        # Log the exception
        print(f"Exception occurred while updating schedule: {e}")
        return jsonify({'message': 'Request withdrawn, but an error occurred while updating schedule.', 'error': str(e)}), 500

    return jsonify({'message': 'Request withdrawn successfully.'}), 200




# ---------------------------------- Cancel Request ----------------------------------

@app.route('/request/cancel/<int:request_id>', methods=['PUT'])
def cancel_request(request_id):
    # Retrieve custom headers
    role = request.headers.get('X-Role')
    client_staff_id = request.headers.get('X-Staff-ID')
    manager_department = request.headers.get('X-Department')

    # Debugging: Print retrieved headers
    print(f"Role: {role}, Client Staff ID: {client_staff_id}, Manager Department: {manager_department}, Request ID: {request_id}")

    # Validate the presence of necessary headers
    if not role or not client_staff_id or not manager_department:
        return jsonify({'message': 'Missing authentication headers.'}), 400

    # Convert role and client_staff_id to integers
    try:
        role = int(role)
        client_staff_id = int(client_staff_id)
    except ValueError:
        return jsonify({'message': 'Invalid data types for role or staff ID.'}), 400

    # Authorization Logic:
    # Role 1: Manager can cancel any request within their department
    # Role 2: Staff can only cancel their own requests
    if role == 2:
        # Staff attempting to cancel their own request
        request_obj = RequestModel.query.get(request_id)

        print("HELLLLLLLLOOOOOOOOO", request_obj)

        if not request_obj:
            return jsonify({'message': 'Unauthorized to cancel this request or request already processed.'}), 403
    elif role == 1:
        # Manager attempting to cancel a request within their department
        request_obj = RequestModel.query.filter_by(
            request_id=request_id, status='pending', department=manager_department
        ).first()
        if not request_obj:
            return jsonify({'message': 'Request not found, already processed, or not within your department.'}), 404
    else:
        return jsonify({'message': 'Invalid role.'}), 400

    # Proceed to cancel the request
    request_obj.status = 'Cancelled'
    db.session.commit()

    # Debugging: Print updated request object
    print(f"Updated Request: {request_obj.to_dict()}")

    # Communicate with the Schedule microservice to update the schedule
    schedule_update_url = "http://localhost:5004/schedule/update"  # Update if necessary
    schedule_update_data = {
        'staff_id': request_obj.staff_id,
        'date': request_obj.start_date.isoformat(),
        'department': request_obj.department,
        'status': request_obj.status
    }

    try:
        response = requests.post(schedule_update_url, json=schedule_update_data)
        if response.status_code != 200:
            # Log the error or handle it as needed
            print(f"Schedule microservice responded with status code {response.status_code}")
            return jsonify({'message': 'Request canceled, but failed to update schedule.'}), 500
    except Exception as e:
        # Log the exception
        print(f"Exception occurred while updating schedule: {e}")
        return jsonify({
            'message': 'Request canceled, but an error occurred while updating schedule.',
            'error': str(e)
        }), 500

    return jsonify({'message': 'Request canceled successfully.'}), 200





# ---------------------------------- Main ----------------------------------

if __name__ == '__main__':
    app.run(port=5003, debug=True)