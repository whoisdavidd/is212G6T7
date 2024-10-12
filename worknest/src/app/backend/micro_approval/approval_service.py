# handles the logic for approval/rejection 
from flask import Flask, request, jsonify
import pika
import json
import logging
from flask_cors import CORS
import os
from flask_sqlalchemy import SQLAlchemy
import requests
from dotenv import load_dotenv
from datetime import datetime
import audit_log

load_dotenv()  # Load environment variables from .env file

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')  # This should read from your .env file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db =SQLAlchemy(app)
class RequestModel(db.Model):
    __tablename__ = "request"
    request_id = db.Column(db.Integer, primary_key=True, nullable=False)
    staff_id = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    reporting_manager_id = db.Column(db.Integer)
    reporting_manager_name = db.Column(db.String(50))
    reporting_manager_email = db.Column(db.String(50))  # New field for approver email
    requester_email = db.Column(db.String(50))          # New field for requester email
    day_id = db.Column(db.Integer)
    recurring_days = db.Column(db.Integer)
    approver_comment = db.Column(db.String(50))

    def __init__(self, request_id, staff_id, department, start_date, reason, duration, status, reporting_manager_id, reporting_manager_name, reporting_manager_email, requester_email, day_id, recurring_days, approver_comment):
        self.request_id = request_id
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
            'reporting_manager_email': self.reporting_manager_email,  # New field
            'requester_email': self.requester_email,                  # New field
            'day_id': self.day_id,
            'recurring_days': self.recurring_days,
            'approver_comment': self.approver_comment
        }

class AuditLogModel(db.Model):
    __tablename__ = 'audit_log'

    log_id = db.Column(db.Integer, primary_key=True)  # Primary key
    request_id = db.Column(db.Integer, nullable=False)  # Foreign key to the request table
    action = db.Column(db.String(50), nullable=False)  # Action performed (e.g., 'approved' or 'rejected')
    approver_id = db.Column(db.Integer, nullable=False)  # ID of the approver
    approver_email = db.Column(db.String(50), nullable=False)  # Email of the approver
    action_timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())  # Auto log time
    start_date = db.Column(db.Date, nullable=False)  # Start date of the request being approved/rejected
    duration = db.Column(db.String(50), nullable=False)  # Duration of the request

    def __init__(self, request_id, action, approver_id, approver_email, start_date, duration):
        self.request_id = request_id
        self.action = action
        self.approver_id = approver_id
        self.approver_email = approver_email
        self.start_date = start_date
        self.duration = duration

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
 
def send_rabbitmq_message(action, requester_email, approver_email, wfh_date, approver_comment):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
    channel = connection.channel()
    
    # Declare a queue for notifications
    channel.queue_declare(queue='email_queue', durable=True)
    
    # Create the message data
    message = {
        'action': action,
        'email': requester_email,
        'approver_email': approver_email,
        'wfh_date': wfh_date,
        'approver_comment': approver_comment
    }
    
    # Publish the message to the queue
    channel.basic_publish(
        exchange='',
        routing_key='email_queue',
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,  # Make the message persistent
        )
    )
    
    connection.close()

@app.route('/approve_request', methods=['POST'])
def approve_request():
    logging.info("Received POST request on /approve_request")
    data = request.json
    logging.info(f"Received approval request: {data}")
    request_id = data['request_id']
    approver_id = data['approver_id']
    approver_email = data['approver_email']
    wfh_date = data['wfh_date']
    duration = int(data.get('duration', 1))  # Get duration (number of days)
    approver_comment = data.get('approver_comment', '')

  # Fetch the request from the database
    request_record = RequestModel.query.filter_by(request_id=request_id).first()

    if not request_record:
        return jsonify({'status': 'Request not found'}), 404

    # Logic to update the status to "Approved" and handle recurring requests
    recurring_days = request_record.recurring_days
    if recurring_days:
        for day in recurring_days:
            # Approve each recurring day (in this case just an example, modify as per logic)
            logging.info(f"Approving recurring request for day: {day}")
            update_request_status(request_id, 'Approved', approver_id, approver_comment, wfh_date, day)
    else:
        # Single request approval
        update_request_status(request_id, 'Approved', approver_id, approver_comment, wfh_date)

    # Log the approval in the audit log
    create_audit_log(request_id, 'approved', approver_id, approver_email, request_record.start_date, request_record.duration)

    # Notify the requester via RabbitMQ
    send_rabbitmq_message('approved', data['requester_email'], approver_email, wfh_date, approver_comment)
    
    return jsonify({'status': 'Request approved'}), 200

@app.route('/reject_request', methods=['POST'])
def reject_request():
    data = request.json
    logging.info(f"Received rejection request: {data}")
    request_id = data['request_id']
    approver_id = data['approver_id']
    approver_email = data['approver_email']
    wfh_date = data['wfh_date']
    approver_comment = data.get('approver_comment', '')

    # Fetch the request from the database
    request_record = RequestModel.query.filter_by(request_id=request_id).first()

    if not request_record:
        return jsonify({'status': 'Request not found'}), 404

    # Logic to update the status to "Rejected"
    update_request_status(request_id, 'Rejected', approver_id, approver_comment, wfh_date)

    # Log the rejection in the audit log
    create_audit_log(request_id, 'rejected', approver_id, approver_email, request_record.start_date, request_record.duration)

    # Notify the requester via RabbitMQ
    send_rabbitmq_message('rejected', data['requester_email'], approver_email, wfh_date, approver_comment)

    return jsonify({'status': 'Request rejected'}), 200

def update_request_status(request_id, new_status, approver_id, approver_comment, wfh_date, day=None):
    # Query the request by request_id
    request_record = RequestModel.query.filter_by(request_id=request_id).first()

    if request_record:
        # Update the fields
        request_record.status = new_status
        request_record.reporting_manager_id = approver_id
        request_record.approver_comment = approver_comment
        request_record.start_date = wfh_date if not day else f"{wfh_date} (Day {day})"
        
        # Commit the changes
        db.session.commit()
        return True
    else:
        return False

def create_audit_log(request_id, action, approver_id, approver_email, start_date, duration):
    new_log = AuditLogModel(
        request_id=request_id,
        action=action,
        approver_id=approver_id,
        approver_email=approver_email,
        start_date=start_date,  # Log the specific WFH start date
        duration=duration  # Log the duration of the WFH request
    )
    db.session.add(new_log)
    db.session.commit()


@app.route('/audit_log', methods=['GET'])
def get_audit_log():
    logs = AuditLogModel.query.all()
    log_list = [log.to_dict() for log in logs]
    return jsonify(log_list), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006, debug=True) 

