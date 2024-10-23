# handles the logic for approval/rejection + audit log 
from flask import Flask, request, jsonify
import pika
import json
import logging
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()  # Load environment variables from .env file

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')  # This should read from your .env file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = os.getenv('SECRET_KEY')  # Replace with a secure key
db = SQLAlchemy(app)

# Base URLs for microservices
MICRO_REQUEST_URL = "http://127.0.0.1:5003"
MICRO_SCHEDULE_URL = "http://127.0.0.1:5004"

class AuditLogModel(db.Model):
    __tablename__ = 'audit_log'

    log_id = db.Column(db.Integer, primary_key=True)  # Primary key
    request_id = db.Column(db.Integer, nullable=False, unique=True)  # Foreign key to the request table
    requester_email = db.Column(db.String(50), nullable=False)
    action = db.Column(db.String(50), nullable=False)  # Action performed (e.g., 'approved' or 'rejected')
    reporting_manager_id = db.Column(db.Integer, nullable=False)  # ID of the approver
    reporting_manager_email = db.Column(db.String(50), nullable=False)  # Email of the approver
    action_timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())  # Auto log time
    requested_dates = db.Column(db.ARRAY(db.Date), nullable=False)  # Dates of the request being approved/rejected
    department = db.Column(db.String(50), nullable=False)
    approver_comment = db.Column(db.String(50))

    def __init__(self, request_id, requester_email, action, reporting_manager_id, reporting_manager_email, requested_dates, department, approver_comment):
        self.request_id = request_id
        self.requester_email = requester_email
        self.action = action
        self.reporting_manager_id = reporting_manager_id
        self.reporting_manager_email = reporting_manager_email
        self.requested_dates = requested_dates
        self.department = department
        self.approver_comment = approver_comment

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
    
    def to_dict(self):
        return {
            'log_id': self.log_id,
            'request_id': self.request_id,
            'requester_email': self.requester_email,
            'action': self.action,
            'reporting_manager_id': self.reporting_manager_id,
            'reporting_manager_email': self.reporting_manager_email,
            'action_timestamp': self.action_timestamp.isoformat(),
            'requested_dates': [date.isoformat() for date in self.requested_dates],
            'department': self.department,
            'approver_comment': self.approver_comment
        }

def send_rabbitmq_message(action, requester_email, reporting_manager_email, requested_dates, approver_comment):
    connection, channel = setup_rabbitmq_connection()
    
    message = {
        'action': action,
        'email': requester_email,
        'reporting_manager_email': reporting_manager_email,
        'requested_dates': requested_dates,
        'approver_comment': approver_comment
    }
    
    publish_message(channel, json.dumps(message))
    connection.close()

##### Approve Request #####

@app.route('/approve_request', methods=['POST'])
def approve_request():
    logging.info("Received POST request on /approve_request")
    data = request.json
    
    request_id = data['request_id']
    reporting_manager_id = data['reporting_manager_id']
    approver_comment = data.get('approver_comment', '')

    # Fetch request details from micro_request service
    request_response = requests.get(f"{MICRO_REQUEST_URL}/requests/{request_id}")
    if request_response.status_code != 200:
        return jsonify({'status': 'Request not found'}), 404

    request_record = request_response.json()

    update_request_status(request_id, 'Approved', reporting_manager_id, approver_comment)

    create_audit_log(request_id, request_record['requester_email'], 'Approved', reporting_manager_id, request_record['reporting_manager_email'], request_record['requested_dates'], request_record['department'], approver_comment)

    send_rabbitmq_message('Approved', request_record['requester_email'], request_record['reporting_manager_email'], request_record['requested_dates'], approver_comment)

    # Update schedule in micro_schedule service
    for date in request_record['requested_dates']:
        schedule_data = {
            "staff_id": request_record['staff_id'],
            "date": date,
            "department": request_record['department'],
            "status": "Approved"
        }
        schedule_response = requests.post(f"{MICRO_SCHEDULE_URL}/schedules", json=schedule_data)
        if schedule_response.status_code != 200:
            logging.error(f"Failed to update schedule for staff_id {request_record['staff_id']} on {date}.")

    return jsonify({'status': 'Request approved'}), 200

##### Reject Request #####

@app.route('/reject_request', methods=['POST'])
def reject_request():
    logging.info("Received POST request on /reject_request")
    data = request.json
    
    request_id = data['request_id']
    reporting_manager_id = data['reporting_manager_id']
    approver_comment = data.get('approver_comment', '')

    # Fetch request details from micro_request service
    request_response = requests.get(f"{MICRO_REQUEST_URL}/requests/{request_id}")
    if request_response.status_code != 200:
        return jsonify({'status': 'Request not found'}), 404

    request_record = request_response.json()

    update_request_status(request_id, 'Rejected', reporting_manager_id, approver_comment)

    create_audit_log(request_id, request_record['requester_email'], 'Rejected', reporting_manager_id, request_record['reporting_manager_email'], request_record['requested_dates'], request_record['department'], approver_comment)

    send_rabbitmq_message('Rejected', request_record['requester_email'], request_record['reporting_manager_email'], request_record['requested_dates'], approver_comment)

    return jsonify({'status': 'Request rejected'}), 200

def update_request_status(request_id, new_status, reporting_manager_id, approver_comment):
    # Fetch request details from micro_request service
    request_response = requests.get(f"{MICRO_REQUEST_URL}/requests/{request_id}")
    if request_response.status_code != 200:
        logging.error(f"Request with request_id {request_id} not found.")
        return False

    request_record = request_response.json()

    # Update the fields
    request_record['status'] = new_status
    request_record['reporting_manager_id'] = reporting_manager_id
    request_record['approver_comment'] = approver_comment

    # Update request status in micro_request service
    update_response = requests.put(f"{MICRO_REQUEST_URL}/requests/{request_id}", json=request_record)
    if update_response.status_code != 200:
        logging.error(f"Failed to update request status for request_id {request_id}.")
        return False

    return True

def create_audit_log(request_id, requester_email, action, reporting_manager_id, reporting_manager_email, requested_dates, department, approver_comment):
    new_log = AuditLogModel(
        request_id=request_id,
        requester_email=requester_email,
        action=action,
        reporting_manager_id=reporting_manager_id,
        reporting_manager_email=reporting_manager_email,
        requested_dates=requested_dates,
        department=department,
        approver_comment=approver_comment
    )
    db.session.add(new_log)
    db.session.commit()

@app.route('/audit_log', methods=['GET'])
def get_audit_log():
    logs = AuditLogModel.query.all()
    log_list = [log.to_dict() for log in logs]
    return jsonify(log_list), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=True) 

