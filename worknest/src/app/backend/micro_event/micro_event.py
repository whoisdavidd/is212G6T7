from datetime import datetime
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
import os
from flask_cors import CORS
import logging
from flasgger import Swagger

load_dotenv()

app = Flask(__name__)

db_url = os.getenv("SQLALCHEMY_DATABASE_URI")

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flasgger
swagger = Swagger(app)

class Event(db.Model):
    __tablename__ = 'event'

    id = db.Column(db.Integer, primary_key=True)
    department = db.Column(db.String(50), nullable=False)
    event_name = db.Column(db.String(50), nullable=False)
    event_date = db.Column(db.Date, nullable=False)

    def __init__(self, department, event_name, event_date):
        self.department = department
        self.event_name = event_name
        self.event_date = datetime.strptime(event_date, '%Y-%m-%d').date()

    def to_dict(self):
        return {
            'id': self.id,
            'department': self.department,
            'event_name': self.event_name,
            'event_date': self.event_date.strftime('%Y-%m-%d')
        }
    

# ------------------------------ Get All Events ------------------------------

@app.route('/events', methods=['GET'])
def get_all_events():
    """
    Get all events
    ---
    responses:
      200:
        description: A list of events
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: integer
              department:
                type: string
              event_name:
                type: string
              event_date:
                type: string
      500:
        description: Failed to fetch events
    """
    logger.info("Request received to fetch all events.")
    try:
        events = Event.query.all()
        logger.info(f"Fetched {len(events)} events successfully.")
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        logger.error(f"Error fetching events: {str(e)}")
        return jsonify({"error": "Failed to fetch events"}), 500
    
# ------------------------------ Get Events by Department ------------------------------
@app.route('/events/<department>', methods=['GET'])
def get_events_by_department(department):
    logger.info(f"Request received to fetch events for department: {department}")
    try:
        events = Event.query.filter_by(department=department).all()
        logger.info(f"Fetched {len(events)} events successfully for department: {department}")
        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        logger.error(f"Error fetching events for department {department}: {str(e)}")
        return jsonify({"error": f"Failed to fetch events for department {department}"}), 500
    
# ------------------------------ Add Event ------------------------------
@app.route('/events', methods=['POST'])
def add_event():
    logger.info("Request received to add an event.")
    try:
        data = request.get_json()
        new_event = Event(**data)
        db.session.add(new_event)
        db.session.commit()
        logger.info(f"Event added successfully: {new_event.to_dict()}")
        return jsonify(new_event.to_dict()), 201
    except Exception as e:
        logger.error(f"Error adding event: {str(e)}")
        return jsonify({"error": "Failed to add event"}), 500

# ------------------------------ Delete Event ------------------------------
@app.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    logger.info(f"Request received to delete event with ID: {event_id}")
    try:
        event = Event.query.get(event_id)
        if not event:
            logger.error(f"Event with ID {event_id} not found")
            return jsonify({"error": "Event not found"}), 404
        db.session.delete(event)
        db.session.commit()
        logger.info(f"Event deleted successfully: {event_id}")
        return jsonify({"message": "Event deleted successfully"}), 200
    except Exception as e:
        logger.error(f"Error deleting event: {str(e)}")
        return jsonify({"error": "Failed to delete event"}), 500
  


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
