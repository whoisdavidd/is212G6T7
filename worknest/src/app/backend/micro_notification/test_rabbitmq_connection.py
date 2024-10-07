import pika
import json


def test_rabbitmq_connection():
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()
        channel.queue_declare(queue='email_queue', durable=True)
        message = {'test': 'message'}
        channel.basic_publish(exchange='', routing_key='email_queue', body=json.dumps(message))
        print("Message sent successfully!")
    except Exception as e:
        print("Error:", e)
    finally:
        connection.close()

if __name__ == "__main__":
    test_rabbitmq_connection()
