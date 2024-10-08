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
load_dotenv()  # Load environment variables from .env file

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')  # This should read from your .env file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db =SQLAlchemy(app)

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
    logging.info(f"Request data: {request.json}")
    data = request.json
    logging.info(f"Received approval request: {data}")
    request_id = data['request_id']
    approver_id = data['approver_id']  # Change manager_id to approver_id
    approver_email = data['approver_email']
    wfh_date = data['wfh_date']  # New field for work from home date
    approver_comment = data.get('approver_comment', '')

    # Logic to update the status to "Approved"
    update_request_status(request_id, 'Approved', approver_id, approver_comment)
    
    # Notify the requester via RabbitMQ
    send_rabbitmq_message({
        'action': 'approved',
        'request_id': request_id,
        'approver_id': approver_id,  # Add the approver's ID
        'approver_comment': approver_comment,
        'email': data['requester_email'],
        'approver_email': approver_email,
        'wfh_date': wfh_date
    })
    
    return jsonify({'status': 'Request approved'}), 200

@app.route('/reject_request', methods=['POST'])
def reject_request():
    data = request.json
    logging.info(f"Received rejection request: {data}")
    request_id = data['request_id']
    approver_id = data['approver_id']  
    approver_email = data['approver_email']
    wfh_date = data['wfh_date']  # New field for work from home date
    approver_comment = data.get('approver_comment', '')

    # Logic to update the status to "Rejected"
    update_request_status(request_id, 'Rejected', approver_id, approver_comment)
    
    # Notify the requester via RabbitMQ
    send_rabbitmq_message({
        'action': 'rejected',
        'request_id': request_id,
        'approver_id': approver_id,  # Add the approver's ID
        'coapprover_commentmment': approver_comment,
        'email': data['requester_email'],
        'approver_email': approver_email,
        'wfh_date': wfh_date
    })

    return jsonify({'status': 'Request rejected'}), 200

def update_request_status(request_id, new_status, approver_id, wfh_date, approver_comment):
    # Query the request by request_id
    request = requests.query.filter_by(request_id=request_id).first()
    
    if request:
        # Update the fields
        request.status = new_status
        request.reporting_manager_id = approver_id
        request.reporting_manager_name = approver_comment  # Assuming comment is the manager's name
        request.startDate = wfh_date
        # Commit the changes
        db.session.commit()
        return True
    else:
        return False

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5006, debug=True)  # Make sure to run on port 5005

