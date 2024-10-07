# rabbitmq connection setup
import pika
import os

def setup_rabbitmq_connection():
    """Establish a connection to RabbitMQ and declare the email queue."""
    rabbitmq_host = os.getenv('RABBITMQ_HOST', 'rabbitmq')  # Fallback to localhost if not set
    credentials = pika.PlainCredentials('guest', 'guest')  # Replace with actual credentials
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host, credentials=credentials))
    channel = connection.channel()
    
    # Declare a durable queue, ensuring it survives RabbitMQ restarts
    channel.queue_declare(queue='email_queue', durable=True)
    
    return connection, channel  # Return both connection and channel

MSG_PROPERTIES = pika.BasicProperties(delivery_mode=2)
def publish_message(channel, message):
    """Publish a message to the email_queue."""
    channel.basic_publish(
        exchange='',
        routing_key='email_queue',
        body=message,
        properties=MSG_PROPERTIES,
        mandatory=True
    )

def close_connection(connection):
    """Close the RabbitMQ connection."""
    if connection:
        connection.close()

# Example usage
if __name__ == "__main__":
    connection, channel = setup_rabbitmq_connection()  # Capture both connection and channel
    message = "Hello, this is a persistent message!"  # Example message
    publish_message(channel, message)
    close_connection(connection)  # Close the connection after publishing
