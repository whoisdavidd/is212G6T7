import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
import logging
from flasgger import Swagger

load_dotenv()

db_url = os.getenv("SQLALCHEMY_DATABASE_URI")

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Worknest1234!@worknest.cr0a4u0u8ytj.ap-southeast-1.rds.amazonaws.com:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flasgger
swagger = Swagger(app)

class Schedule(db.Model):
    __tablename__ = "schedule"
    
    staff_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(50), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    
    def __init__(self, staff_id, date, department, status):
        self.staff_id = staff_id
        self.date = date
        self.department = department
        self.status = status

    def to_dict(self):
        return {
            'staff_id': self.staff_id,
            'date': self.date,
            'department': self.department,
            'status': self.status
        }
    
# ------------------------------ Create a schedule ------------------------------

@app.route('/schedules', methods=['POST'])
def create_or_update_schedule():
    """
    Create or update a schedule
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            staff_id:
              type: integer
            date:
              type: string
            department:
              type: string
            status:
              type: string
    responses:
      200:
        description: Schedule updated successfully
      201:
        description: New schedule created successfully
      500:
        description: Failed to create or update schedule
    """
    try:
        data = request.get_json()
        schedule_entry = Schedule.query.filter_by(staff_id=data['staff_id']).first()

        if schedule_entry:
            schedule_entry.date = data['date']
            schedule_entry.department = data['department']
            schedule_entry.status = data['status']
            message = "Schedule updated successfully"
        else:
            new_schedule = Schedule(
                staff_id=data['staff_id'],
                date=data['date'],
                department=data['department'],
                status=data['status']
            )
            db.session.add(new_schedule)
            message = "New schedule created successfully"

        db.session.commit()
        return jsonify({"message": message}), 200 if schedule_entry else 201

    except Exception as e:
        logger.error(f"Error creating or updating schedule: {str(e)}")
        return jsonify({"error": "Failed to create or update schedule"}), 500
    

# ------------------------------ Update a schedule ------------------------------

@app.route('/schedules/<int:staff_id>', methods=['PUT'])
def update_schedule(staff_id):
    """
    Update a schedule
    ---
    parameters:
      - name: staff_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Schedule updated successfully
      404:
        description: Schedule not found
      500:
        description: Failed to update schedule
    """
    try:
        schedule_entry = Schedule.query.filter_by(staff_id=staff_id).first()
        if not schedule_entry:
            return jsonify({"message": "Schedule not found"}), 404
        data = request.get_json()
        schedule_entry.date = data.get('date', schedule_entry.date)
        schedule_entry.department = data.get('department', schedule_entry.department)
        schedule_entry.status = data.get('status', schedule_entry.status)
        db.session.commit()
        return jsonify({"message": "Schedule updated successfully"}), 200
    except Exception as e:
        logger.error(f"Error updating schedule: {str(e)}")
        return jsonify({"error": "Failed to update schedule"}), 500
    

# ------------------------------ Get all schedules ------------------------------

@app.route('/schedules', methods=['GET'])
def get_all_schedules():
    """
    Get all schedules
    ---
    responses:
      200:
        description: Schedules fetched successfully
      500:
        description: Failed to fetch schedules
    """
    try:
        schedules = Schedule.query.all()
        return jsonify([schedule.to_dict() for schedule in schedules]), 200
    except Exception as e:
        logger.error(f"Error fetching schedules: {str(e)}")
        return jsonify({"error": "Failed to fetch schedules"}), 500
    

# ------------------------------ Get a schedule by staff_id ------------------------------

@app.route('/schedules/<int:staff_id>', methods=['GET'])
def get_schedule(staff_id):
    """
    Get a schedule by staff_id
    ---
    parameters:
      - name: staff_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Schedule fetched successfully
      404:
        description: Schedule not found
      500:
        description: Failed to fetch schedule
    """
    try:
        schedule = Schedule.query.filter_by(staff_id=staff_id).first()
        if schedule:
            return jsonify(schedule.to_dict()), 200
        return jsonify({"message": "Schedule not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching schedule: {str(e)}")
        return jsonify({"error": "Failed to fetch schedule"}), 500

if __name__ == '__main__':
    app.run(port=5004, debug=True)
