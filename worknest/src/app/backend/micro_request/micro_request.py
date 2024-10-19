from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests
from datetime import datetime

load_dotenv()

db_url = os.getenv("SQLALCHEMY_DATABASE_URI")

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'supersecretkey')  # Replace with a secure key or use an environment variable

CORS(app) # Replace with your frontend's URL

app.config['SQLALCHEMY_DATABASE_URI'] =db_url # Use the database URL from the environment variable
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class RequestModel(db.Model):
    __tablename__ = "request"
    request_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    staff_id = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    reporting_manager_id = db.Column(db.Integer, nullable=False)
    reporting_manager_name = db.Column(db.String(50), nullable=False)
    reporting_manager_email = db.Column(db.String(50), nullable=False)
    requester_email = db.Column(db.String(50), nullable=False)
    day_id = db.Column(db.Integer, nullable=True)  # Allowing null values
    recurring_days = db.Column(db.Integer, nullable=True)  # Allowing null values
    approver_comment = db.Column(db.String(50), nullable=True)  # Allowing null values
    
    def __init__(self, staff_id, department, start_date, reason, duration, status, reporting_manager_id, reporting_manager_name, reporting_manager_email, requester_email, day_id=None, recurring_days=None, approver_comment=None):
        self.staff_id = staff_id
        self.department = department
        self.start_date = start_date
        self.reason = reason
        self.duration = duration
        self.status = status
        self.reporting_manager_id = reporting_manager_id
        self.reporting_manager_name = reporting_manager_name
        self.reporting_manager_email = reporting_manager_email
        self.requester_email = requester_email
        self.day_id = day_id
        self.recurring_days = recurring_days
        self.approver_comment = approver_comment
        
    def to_dict(self):
        return {
            'request_id': self.request_id,
            'staff_id': self.staff_id,
            'department': self.department,
            'start_date': self.start_date,
            'reason': self.reason,
            'duration': self.duration,
            'status': self.status,
            'reporting_manager_id': self.reporting_manager_id,
            'reporting_manager_name': self.reporting_manager_name,
            'reporting_manager_email': self.reporting_manager_email,
            'requester_email': self.requester_email,
            'day_id': self.day_id,
            'recurring_days': self.recurring_days,
            'approver_comment': self.approver_comment
        }

# ---------------------------------- Get All Requests ----------------------------------

@app.route('/request', methods=['GET'])
def get_all_requests():
    requests = RequestModel.query.all()
    return jsonify([request.to_dict() for request in requests])


# Get all requests for a specific manager, based on reporting_manager_id
@app.route('/requests/manager/<int:manager_id>', methods=['GET'])
def get_requests_for_manager(manager_id):
    # Fetch all requests where the reporting_manager_id matches the manager_id
    requests = RequestModel.query.filter_by(reporting_manager_id=manager_id).all()

    if requests:
        return jsonify([request.to_dict() for request in requests]), 200
    return jsonify({"message": "No requests found for this manager."}), 404



# ---------------------------------- Get Requests for Specific Staff ----------------------------------

@app.route('/request/staff/<int:staff_id>', methods=['GET'])
def get_staff_requests(staff_id):
    staff_requests = RequestModel.query.filter_by(staff_id=staff_id).all()
    if not staff_requests:
        return jsonify({'message': 'No requests found for this staff member.'}), 404
    return jsonify([request.to_dict() for request in staff_requests]), 200


# ---------------------------------- Get specific Requests by request_id ----------------------------------
@app.route('/request/<int:request_id>', methods=['GET'])
def get_request(request_id):
    request = RequestModel.query.get(request_id)
    if not request:
        return jsonify({'message': 'Request not found'}), 404
    return jsonify(request.to_dict()), 200

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
        reporting_manager_email=data['reporting_manager_email'],
        requester_email=data['requester_email'],
        day_id=data.get('day_id'),  
        recurring_days=data.get('recurring_days'),  
        approver_comment=data.get('approver_comment')
    )
    db.session.add(new_request)
    db.session.commit()
    return jsonify(new_request.to_dict()), 201

# ---------------------------------- Withdraw Request ----------------------------------

@app.route('/request/withdraw/<int:request_id>', methods=['PUT'])
def withdraw_request(request_id):
    role = request.headers.get('X-Role')
    client_staff_id = request.headers.get('X-Staff-ID')
    manager_department = request.headers.get('X-Department')

    # Check if all headers are provided
    if not role or not client_staff_id or not manager_department:
        return jsonify({'message': 'Missing authentication headers.'}), 400

    try:
        role = int(role)
        client_staff_id = int(client_staff_id)
    except ValueError:
        return jsonify({'message': 'Invalid data types for role or staff ID.'}), 400

    request_obj = None

    # Role 2: Staff - can withdraw pending requests they created
    if role == 2:
        request_obj = RequestModel.query.filter_by(
            request_id=request_id, staff_id=client_staff_id, status='pending'
        ).first()
        if not request_obj:
            return jsonify({'message': 'Unauthorized to withdraw this request or request already processed.'}), 403

    # Role 1: HR - can withdraw pending requests
    elif role == 1:
        request_obj = RequestModel.query.filter_by(
            request_id=request_id, status='pending'
        ).first()
        if not request_obj:
            return jsonify({'message': 'Request not found or already processed.'}), 404

    # Role 3: Manager - can withdraw approved requests in their department
    elif role == 3:
        # Strip and normalize department to ensure there's no extra space
        manager_department = manager_department.strip()
        print(f"Normalized Department: '{manager_department}'")

        # Execute the query with correct case matching
        # request_obj = RequestModel.query.filter(
        #     RequestModel.request_id == request_id,
        #     RequestModel.status == 'Approved',  # Match exact casing
        #     RequestModel.department.ilike(manager_department)  # Case-insensitive match for department
        # ).first()

        request_objs = RequestModel.query.filter(RequestModel.request_id == request_id).all()
        for req in request_objs:
            print(f"Request ID: {req.request_id}, Status: {req.status}, Department: '{req.department}'")


        if not request_obj:
            print(f"Request not found with ID: {request_id}, Status: 'Approved', Department: '{manager_department}'")
            return jsonify({'message': 'Request not found, already processed, or not within your department.'}), 404

    else:
        return jsonify({'message': 'Invalid role.'}), 400

    # Update the request status to 'Withdrawn'
    request_obj.status = 'Withdrawn'
    db.session.commit()

    # Update the schedule if necessary
    schedule_update_url = "http://localhost:5004/schedule/update"  
    schedule_update_data = {
        'staff_id': request_obj.staff_id,
        'date': request_obj.start_date,
        'department': request_obj.department,
        'status': request_obj.status
    }

    try:
        response = requests.post(schedule_update_url, json=schedule_update_data)
        if response.status_code != 200:
            return jsonify({'message': 'Request withdrawn, but failed to update schedule.'}), 500
    except Exception as e:
        return jsonify({'message': 'Request withdrawn, but an error occurred while updating schedule.', 'error': str(e)}), 500

    return jsonify({'message': 'Request withdrawn successfully.'}), 200





# ---------------------------------- Cancel Request ----------------------------------

@app.route('/request/cancel/<int:request_id>', methods=['PUT'])
def cancel_request(request_id):
    role = request.headers.get('X-Role')
    client_staff_id = request.headers.get('X-Staff-ID')
    manager_department = request.headers.get('X-Department')

    if not role or not client_staff_id or not manager_department:
        return jsonify({'message': 'Missing authentication headers.'}), 400

    try:
        role = int(role)
        client_staff_id = int(client_staff_id)
    except ValueError:
        return jsonify({'message': 'Invalid data types for role or staff ID.'}), 400

    if role == 2:
        request_obj = RequestModel.query.get(request_id)
        if not request_obj:
            return jsonify({'message': 'Unauthorized to cancel this request or request already processed.'}), 403
    elif role == 1:
        request_obj = RequestModel.query.filter_by(
            request_id=request_id, status='pending', department=manager_department
        ).first()
        if not request_obj:
            return jsonify({'message': 'Request not found, already processed, or not within your department.'}), 404
    else:
        return jsonify({'message': 'Invalid role.'}), 400

    request_obj.status = 'Cancelled'
    db.session.commit()

    schedule_update_url = "http://localhost:5004/schedule/update"  
    schedule_update_data = {
        'staff_id': request_obj.staff_id,
        'date': request_obj.start_date,
        'department': request_obj.department,
        'status': request_obj.status
    }

    try:
        response = requests.post(schedule_update_url, json=schedule_update_data)
        if response.status_code != 200:
            return jsonify({'message': 'Request canceled, but failed to update schedule.'}), 500
    except Exception as e:
        return jsonify({'message': 'Request canceled, but an error occurred while updating schedule.', 'error': str(e)}), 500

    return jsonify({'message': 'Request canceled successfully.'}), 200


# ---------------------------------- Update Requests ----------------------------------
@app.route('/request/update/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    print(f"Received update request for request_id: {request_id}")
    # Retrieve custom headers
    role = request.headers.get('X-Role')
    client_staff_id = request.headers.get('X-Staff-ID')
    client_department = request.headers.get('X-Department')

    # Validate the presence of necessary headers
    if not role or not client_staff_id or not client_department:
        return jsonify({'message': 'Missing authentication headers.'}), 400

    # Convert role and client_staff_id to integers
    try:
        role = int(role)
        client_staff_id = int(client_staff_id)
    except ValueError:
        return jsonify({'message': 'Invalid data types for role or staff ID.'}), 400

    # Fetch the request object
    request_obj = RequestModel.query.get(request_id)

    if not request_obj:
        return jsonify({'message': 'Request not found.'}), 404

    # Authorization check
    if role == 2 and request_obj.staff_id != client_staff_id:
        return jsonify({'message': 'Unauthorized to update this request.'}), 403
    elif role == 1 and request_obj.department != client_department:
        return jsonify({'message': 'Unauthorized to update request from different department.'}), 403
    # Get data from request body
    data = request.get_json()

    # Update the request object with new data
    try:
        request_obj.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        request_obj.duration = data['duration']
        request_obj.reason = data['reason']
        
        # Update status if it was previously approved
        if request_obj.status == 'Approved' and data.get('status') == 'Pending':
            request_obj.status = 'Pending'

        db.session.commit()
        print(f"Request {request_id} updated successfully")
        return jsonify({
            'message': 'Request updated successfully.',
            'request': request_obj.to_dict()
        }), 200
    except Exception as e:
        print(f"Error updating request {request_id}: {str(e)}")
        db.session.rollback()
        return jsonify({'message': f'Error updating request: {str(e)}'}), 500

    # # Communicate with the Schedule microservice to update the schedule
    # schedule_update_url = "http://localhost:5004/schedule/update"
    # schedule_update_data = {
    #     'staff_id': request_obj.staff_id,
    #     'date': request_obj.start_date.isoformat(),
    #     'department': request_obj.department,
    #     'status': request_obj.status,
    #     'duration': request_obj.duration
    # }

    # try:
    #     response = requests.post(schedule_update_url, json=schedule_update_data)
    #     if response.status_code != 200:
    #         print(f"Schedule microservice responded with status code {response.status_code}")
    #         return jsonify({'message': 'Request updated, but failed to update schedule.'}), 500
    # except Exception as e:
    #     print(f"Exception occurred while updating schedule: {e}")
    #     return jsonify({
    #         'message': 'Request updated, but an error occurred while updating schedule.',
    #         'error': str(e)
    #     }), 500

    # return jsonify({
    #     'message': 'Request updated successfully.',
    #     'request': request_obj.to_dict()
    # }), 200


# ---------------------------------- Main ----------------------------------

if __name__ == '__main__':
    app.run(host="0.0.0.0",port=5000, debug=True)  
