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
db =SQLAlchemy(app)
class RequestModel(db.Model):
    __tablename__ = "request"
    request_id = db.Column(db.Integer, primary_key=True, nullable=False)
    staff_id = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.Integer, nullable=False)
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
    request_id = db.Column(db.Integer, nullable=False, unique=True)  # Foreign key to the request table
    requester_email = db.Column(db.String(50), nullable = False)
    action = db.Column(db.String(50), nullable=False)  # Action performed (e.g., 'approved' or 'rejected')
    reporting_manager_id = db.Column(db.Integer, nullable=False)  # ID of the approver
    reporting_manager_email = db.Column(db.String(50), nullable=False)  # Email of the approver
    action_timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())  # Auto log time
    start_date = db.Column(db.Date, nullable=False)  # Start date of the request being approved/rejected
    duration = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    approver_comment = db.Column(db.String(50))

    def __init__(self, request_id, requester_email, action, reporting_manager_id, reporting_manager_email, start_date, duration, department, approver_comment):
        self.request_id = request_id
        self.requester_email = requester_email
        self.action = action
        self.reporting_manager_id = reporting_manager_id
        self.reporting_manager_email = reporting_manager_email
        self.start_date = start_date
        self.duration = duration
        self.department = department
        self.approver_comment = approver_comment

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
    
    def to_dict(self):
        return {
            'log_id': self.log_id,
            'request_id': self.request_id,
            'requester_email': self.requester_email,  # Include requester_email in the dictionary
            'action': self.action,
            'reporting_manager_id': self.reporting_manager_id,
            'reporting_manager_email': self.reporting_manager_email,
            'action_timestamp': self.action_timestamp.isoformat(),  # Convert to string for JSON serialization
            'start_date': self.start_date.isoformat(),  # Convert to string for JSON serialization
            'duration': self.duration,
            'department': self.department,
            'approver_comment': self.approver_comment

        }
    
class ScheduleModel(db.Model):
    __tablename__ = 'schedule'
    
    staff_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)

    def __init__(self, staff_id, date, department, status):
        self.staff_id = staff_id
        self.date = date
        self.department = department
        self.status = status

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
 
def send_rabbitmq_message(action, requester_email, reporting_manager_email, wfh_date, approver_comment, duration):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
    channel = connection.channel()
    
    # Declare a queue for notifications
    channel.queue_declare(queue='email_queue', durable=True)
    
    # Create the message data
    message = {
        'action': action,
        'email': requester_email,
        'reporting_manager_email': reporting_manager_email,
        'wfh_date': wfh_date,
        'approver_comment': approver_comment, 
        'duration': duration
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

##### Approve Request #####

@app.route('/approve_request', methods=['POST'])
def approve_request():
    logging.info("Received POST request on /approve_request")
    data = request.json
    
    # Extract required data from the request
    request_id = data['request_id']
    reporting_manager_id = data['reporting_manager_id']
    approver_comment = data.get('approver_comment', '')

    # Fetch the request from the database
    request_record = RequestModel.query.filter_by(request_id=request_id).first()
    if not request_record:
        return jsonify({'status': 'Request not found'}), 404

    # Update the status to "Approved" and set the approver's comment and duration
    recurring_days = request_record.recurring_days
    if recurring_days:
        for day in recurring_days:
            logging.info(f"Approving recurring request for day: {day}")
            update_request_status(request_id, 'Approved', reporting_manager_id, approver_comment)
    else:
        update_request_status(request_id, 'Approved', reporting_manager_id, approver_comment)

    # Log the approval in the audit log
    create_audit_log(request_id, request_record.requester_email, 'Approved', reporting_manager_id, request_record.reporting_manager_email, request_record.start_date.isoformat(), request_record.duration, request_record.department, approver_comment)

    # Send RabbitMQ messages
    send_rabbitmq_message('Approved', request_record.requester_email, request_record.reporting_manager_email, request_record.start_date.isoformat(), approver_comment, request_record.duration)
       # Create a new entry in the schedule table
    new_schedule_entry = ScheduleModel(
        staff_id=request_record.staff_id,
        date=request_record.start_date,
        department=request_record.department,
        status="Approved"
    )
    db.session.add(new_schedule_entry)
    db.session.commit()

    return jsonify({'status': 'Request approved'}), 200

##### Reject Request #####

@app.route('/reject_request', methods=['POST'])
def reject_request():
    logging.info("Received POST request on /reject_request")
    data = request.json
    
    # Extract required data from the request
    request_id = data['request_id']
    reporting_manager_id = data['reporting_manager_id']
    approver_comment = data.get('approver_comment', '')

    # Fetch the request from the database
    request_record = RequestModel.query.filter_by(request_id=request_id).first()
    if not request_record:
        return jsonify({'status': 'Request not found'}), 404

    # Update the status to "Rejected"
    update_request_status(request_id, 'Rejected', reporting_manager_id, approver_comment)

    # Log the rejection in the audit log
    create_audit_log(request_id, request_record.requester_email, 'Rejected', reporting_manager_id, request_record.reporting_manager_email, request_record.start_date.isoformat(), request_record.duration, request_record.department, approver_comment)

    # Send RabbitMQ messages
    send_rabbitmq_message('Rejected', request_record.requester_email, request_record.reporting_manager_email, request_record.start_date.isoformat(), approver_comment, request_record.duration)

    return jsonify({'status': 'Request rejected'}), 200

def update_request_status(request_id, new_status, reporting_manager_id, approver_comment, duration=None):
    # Query the request by request_id
    request_record = RequestModel.query.filter_by(request_id=request_id).first()

    if request_record:
        # Update the fields
        request_record.status = new_status
        request_record.reporting_manager_id = reporting_manager_id
        request_record.approver_comment = approver_comment
        
        # Update the duration only if provided
        if duration is not None:
            request_record.duration = duration  # Adjust the duration if needed

        # Handle recurring days if they exist
        recurring_days = request_record.recurring_days
        if recurring_days:
            # Example: Update recurring days logic (this could vary based on your requirements)
            # Here we are just logging the recurring days for demonstration
            logging.info(f"Updating recurring request for days: {recurring_days}")
            # You might want to implement specific logic to handle the recurring days

        # Commit the changes
        db.session.commit()
        return True
    else:
        return False



def create_audit_log(request_id, requester_email, action, reporting_manager_id, reporting_manager_email, start_date, duration, department, approver_comment):
    new_log = AuditLogModel(
        request_id=request_id,
        requester_email=requester_email,
        action=action,
        reporting_manager_id=reporting_manager_id,
        reporting_manager_email=reporting_manager_email,
        start_date=start_date,  # Log the specific WFH start date
        duration=duration,  # Log the duration of the WFH request
        department = department,
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
    app.run(host='0.0.0.0', port=5006, debug=True) 

