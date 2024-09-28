# handles the logic for approval/rejection 
from flask import Flask, request, jsonify
import pika
import json
from amqp_connection import setup_rabbitmq_connection  # Adjust the import path as needed
import logging
from flask_cors import CORS

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
CORS(app)

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
    comment = data.get('comment', '')

    # Logic to update the status to "Approved"
    update_request_status(request_id, 'Approved', approver_id, comment)
    
    # Notify the requester via RabbitMQ
    send_to_queue({
        'action': 'approved',
        'request_id': request_id,
        'approver_id': approver_id,  # Add the approver's ID
        'comment': comment,
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
    comment = data.get('comment', '')

    # Logic to update the status to "Rejected"
    update_request_status(request_id, 'Rejected', approver_id, comment)
    
    # Notify the requester via RabbitMQ
    send_to_queue({
        'action': 'rejected',
        'request_id': request_id,
        'approver_id': approver_id,  # Add the approver's ID
        'comment': comment,
        'email': data['requester_email'],
        'approver_email': approver_email,
        'wfh_date': wfh_date
    })

    return jsonify({'status': 'Request rejected'}), 200

def send_to_queue(message):
    connection, channel = setup_rabbitmq_connection()  # Get the RabbitMQ connection and channel
    channel.basic_publish(
        exchange='',
        routing_key='email_queue',
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2,  # Make message persistent
        )
    )
    connection.close()  # Close the connection after sending the message

def update_request_status(request_id, status, approver_id, comment):
    # Implement database logic to update the request status
    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)  # Make sure to run on port 5005

