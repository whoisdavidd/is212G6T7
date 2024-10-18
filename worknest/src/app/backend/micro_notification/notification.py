# consumes rabbitmq messages & triggers logic to send an email notifications
import pika
import json
from email_notify import send_email_notification
import logging

logging.basicConfig(level=logging.INFO)


def callback(ch, method, properties, body):
    message = json.loads(body)
    logging.info(f"Received message: {message}")

    # Extract details from the message
    action = message['action']
    requester_email = message['email']
    reporting_manager_email = message['reporting_manager_email']
    wfh_date = message['wfh_date']
    approver_comment = message['approver_comment']
    duration = message['duration']
    
    if action == 'Approved':
        requester_subject = "WFH Request Approved"
        requester_body = (
            f"Congratulations! Your request for WFH on {wfh_date} has been approved for a duration of {duration} days.\n"
            f"\nComments: {approver_comment}"
        )
    else:  # action == 'rejected'
        requester_subject = "WFH Request Rejected"
        requester_body = (
            f"Unfortunately, your request for WFH on {wfh_date} has been rejected for a duration of {duration} days.\n"
            f"\nComments: {approver_comment}"
        )

    # Prepare the email content for the approver based on the action
    if action == 'Approved':
        approver_subject = "Approval Confirmation"
        approver_body = f"You have approved the WFH request for {wfh_date} from the requester. Comments: {approver_comment}"
    else:  # action == 'rejected'
        approver_subject = "Rejection Confirmation"
        approver_body = f"You have rejected the WFH request for {wfh_date} from the requester. Comments: {approver_comment}"

    # Send email to requester
    send_email_notification(requester_email, requester_subject, requester_body)
    
    # Send email to approver
    send_email_notification(reporting_manager_email, approver_subject, approver_body)


def start_worker():
    connection = pika.BlockingConnection(pika.ConnectionParameters('rabbitmq', 5672))
    channel = connection.channel()
    channel.queue_declare(queue='email_queue', durable=True)  # Ensure queue is durable
    channel.basic_consume(queue='email_queue', on_message_callback=callback, auto_ack=True)
    print('Worker started, waiting for messages...')
    channel.start_consuming()


if __name__ == "__main__":
    start_worker()

