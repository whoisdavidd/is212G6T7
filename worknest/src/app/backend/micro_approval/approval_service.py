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
from sqlalchemy import Column, Integer, String, TIMESTAMP, Date, ARRAY
from sqlalchemy.ext.declarative import declarative_base


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
    request_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    staff_id = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    reporting_manager_id = db.Column(db.Integer, nullable=False)
    reporting_manager_name = db.Column(db.String(50), nullable=False)
    reporting_manager_email = db.Column(db.String(50), nullable=False)
    requester_email = db.Column(db.String(50), nullable=False)
    approver_comment = db.Column(db.String(50))
    requested_dates = db.Column(db.ARRAY(db.Date))
    time_of_day = db.Column(db.String(10), default='Full Day')

    def __init__(self, staff_id, department, reason, status, reporting_manager_id, reporting_manager_name, reporting_manager_email, requester_email, approver_comment=None, requested_dates=None, time_of_day='Full Day'):
        self.staff_id = staff_id
        self.department = department
        self.reason = reason
        self.status = status
        self.reporting_manager_id = reporting_manager_id
        self.reporting_manager_name = reporting_manager_name
        self.reporting_manager_email = reporting_manager_email
        self.requester_email = requester_email
        self.approver_comment = approver_comment
        self.requested_dates = requested_dates
        self.time_of_day = time_of_day

    def to_dict(self):
        return {
            'request_id': self.request_id,
            'staff_id': self.staff_id,
            'department': self.department,
            'reason': self.reason,
            'status': self.status,
            'reporting_manager_id': self.reporting_manager_id,
            'reporting_manager_name': self.reporting_manager_name,
            'reporting_manager_email': self.reporting_manager_email,
            'requester_email': self.requester_email,
            'approver_comment': self.approver_comment,
            'requested_dates': self.requested_dates,
            'time_of_day': self.time_of_day
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
    requested_date = db.Column(db.Date, nullable=False)  # Array of requested dates
    department = db.Column(db.String(50), nullable=False)
    time_of_day = db.Column(db.String(10), default = 'Full Day', nullable = False)
    approver_comment = db.Column(db.String(50))

    def __init__(self, request_id, requester_email, action, reporting_manager_id, reporting_manager_email, requested_date, time_of_day, department, approver_comment):
        self.request_id = request_id
        self.requester_email = requester_email
        self.action = action
        self.reporting_manager_id = reporting_manager_id
        self.reporting_manager_email = reporting_manager_email
        self.requested_date = requested_date
        self.time_of_day = time_of_day
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
            'requested_date': self.requested_date.isoformat(),  # Convert to string for JSON serialization
            'time_of_day': self.time_of_day,
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
 
def send_rabbitmq_message(action, requester_email, reporting_manager_email, requested_dates, approver_comment):
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq'))
    channel = connection.channel()
    
    # Declare a queue for notifications
    channel.queue_declare(queue='email_queue', durable=True)
    
    # Create the message data
    message = {
        'action': action,
        'email': requester_email,
        'reporting_manager_email': reporting_manager_email,
        'requested_dates': requested_dates,
        'approver_comment': approver_comment, 
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

    # Update the status to "Approved" and set the approver's comment
    update_request_status(request_id, 'Approved', reporting_manager_id, approver_comment)

    # Log the approval in the audit log for each requested date
    for requested_date in request_record.requested_dates:
        create_audit_log(
            request_id,
            request_record.requester_email,
            'Approved',
            reporting_manager_id,
            request_record.reporting_manager_email,
            requested_date.isoformat(),  
            request_record.department,
            request_record.time_of_day,
            approver_comment
        )

        # Send RabbitMQ messages for each requested date
        # send_rabbitmq_message(
        #     'Approved',
        #     request_record.requester_email,
        #     request_record.reporting_manager_email,
        #     requested_date.isoformat(),  # Use the current requested_date
        #     approver_comment,
        # )

        # Create a new entry in the schedule table for each requested date
        new_schedule_entry = ScheduleModel(
            staff_id=request_record.staff_id,
            date=requested_date,  # Use the current requested_date
            department=request_record.department,
            status="Approved"
        )
        db.session.add(new_schedule_entry)

    db.session.commit()  # Commit all changes at once

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

    # Update the status to "rejected" and set the approver's comment
    update_request_status(request_id, 'Rejected', reporting_manager_id, approver_comment)

    # Log the approval in the audit log for each requested date
    for requested_date in request_record.requested_dates:
        create_audit_log(
            request_id,
            request_record.requester_email,
            'Rejected',
            reporting_manager_id,
            request_record.reporting_manager_email,
            requested_date.isoformat(),  
            request_record.department,
            request_record.time_of_day,
            approver_comment
        )

        # Send RabbitMQ messages for each requested date
        send_rabbitmq_message(
            'Rejected',
            request_record.requester_email,
            request_record.reporting_manager_email,
            requested_date.isoformat(),  # Use the current requested_date
            approver_comment,
        )

        # Create a new entry in the schedule table for each requested date
        new_schedule_entry = ScheduleModel(
            staff_id=request_record.staff_id,
            date=requested_date,  # Use the current requested_date
            department=request_record.department,
            status="Rejected"
        )
        db.session.add(new_schedule_entry)

    db.session.commit()  # Commit all changes at once

    return jsonify({'status': 'Request rejected'}), 200


def update_request_status(request_id, new_status, reporting_manager_id, approver_comment):
    # Query the request by request_id
    request_record = RequestModel.query.filter_by(request_id=request_id).first()

    if request_record:
        # Update the fields
        request_record.status = new_status
        request_record.reporting_manager_id = reporting_manager_id
        request_record.approver_comment = approver_comment
        

        # Commit the changes
        db.session.commit()
        return True
    else:
        return False



def create_audit_log(request_id, requester_email, action, reporting_manager_id, reporting_manager_email, requested_date, time_of_day, department, approver_comment):
    new_log = AuditLogModel(
        request_id=request_id,
        requester_email=requester_email,
        action=action,
        reporting_manager_id=reporting_manager_id,
        reporting_manager_email=reporting_manager_email,
        requested_date=requested_date,  # Log the specific requested dates
        time_of_day=time_of_day,  # Log the time of day for the request
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
    app.run(host='0.0.0.0', port=5006, debug=True) 

# port 5006