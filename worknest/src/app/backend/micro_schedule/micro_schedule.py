import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
import logging
from flasgger import Swagger
import requests

load_dotenv()


app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flasgger
swagger = Swagger(app)

class Schedule(db.Model):
    __tablename__ = "schedule"
    
    staff_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, primary_key=True)
    department = db.Column(db.String(50), nullable=False, index=True)
    status = db.Column(db.String(50), nullable=False, index=True)
    
    def __init__(self, staff_id, date, department, status):
        self.staff_id = staff_id
        self.date = datetime.strptime(date, "%Y-%m-%d").date() if isinstance(date, str) else date
        self.department = department
        self.status = status

    def to_dict(self):
        return {
            'staff_id': self.staff_id,
            'date': self.date.strftime("%Y-%m-%d") if self.date else None,
            'department': self.department,
            'status': self.status
        }
    
# ------------------------------ Create or Update a Schedule ------------------------------

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
    logger.info("Request received to create or update a schedule.")
    try:
        data = request.get_json()
        schedule_entry = Schedule.query.filter_by(staff_id=data['staff_id'], date=data['date']).first()

        if schedule_entry:
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
        logger.info(f"Schedule for staff_id {data['staff_id']} {'updated' if schedule_entry else 'created'} successfully.")
        return jsonify({"message": message}), 200

    except Exception as e:
        logger.error(f"Error creating or updating schedule: {str(e)}")
        return jsonify({"error": "Failed to create or update schedule"}), 500
    

# ------------------------------ Update a Schedule ------------------------------

@app.route('/schedules/<int:staff_id>/<string:date>', methods=['PUT'])
def update_schedule(staff_id, date):
    """
    Update a schedule
    ---
    parameters:
      - name: staff_id
        in: path
        type: integer
        required: true
      - name: date
        in: path
        type: string
        required: true
    responses:
      200:
        description: Schedule updated successfully
      404:
        description: Schedule not found
      500:
        description: Failed to update schedule
    """
    logger.info(f"Request received to update schedule for staff_id {staff_id} on date {date}.")
    try:
        schedule_entry = Schedule.query.filter_by(staff_id=staff_id, date=date).first()
        if not schedule_entry:
            logger.warning(f"Schedule for staff_id {staff_id} on date {date} not found.")
            return jsonify({"message": "Schedule not found"}), 404
        data = request.get_json()
        schedule_entry.department = data.get('department', schedule_entry.department)
        schedule_entry.status = data.get('status', schedule_entry.status)
        db.session.commit()
        logger.info(f"Schedule for staff_id {staff_id} on date {date} updated successfully.")
        return jsonify({"message": "Schedule updated successfully"}), 200
    except Exception as e:
        logger.error(f"Error updating schedule: {str(e)}")
        return jsonify({"error": "Failed to update schedule"}), 500
    

# ------------------------------ Get All Schedules ------------------------------

@app.route('/schedules', methods=['GET'])
def get_schedules():
    """
    Get schedules, filtered based on user role
    ---
    parameters:
      - name: staff_id
        in: query
        type: integer
        required: true
        description: Staff ID of the requester
    responses:
      200:
        description: Schedules fetched successfully
      403:
        description: Unauthorized access
      500:
        description: Failed to fetch schedules
    """
    staff_id = request.args.get('staff_id')
    logger.info(f"Request received to fetch schedules for staff_id: {staff_id}")
    
    if not staff_id:
        return jsonify({"error": "Staff ID is required"}), 400

    try:
        # Fetch user profile from micro_profile service
        profile_response = requests.get(f"http://127.0.0.1:5002/profile/{staff_id}")
        if profile_response.status_code != 200:
            return jsonify({"error": "Failed to fetch user profile"}), 500
        
        user_profile = profile_response.json()
        user_role = user_profile.get('role')
        user_department = user_profile.get('department')

        if user_role == 2:  # Staff
            schedules = Schedule.query.filter_by(department=user_department).all()
            logger.info(f"Fetched {len(schedules)} schedules for department {user_department}.")
        elif user_role in [1, 3]:  # Manager or HR
            schedules = Schedule.query.all()
            logger.info(f"Fetched {len(schedules)} schedules across all departments.")
        else:
            return jsonify({"error": "Unauthorized access"}), 403
        
        return jsonify([schedule.to_dict() for schedule in schedules]), 200
    except Exception as e:
        logger.error(f"Error fetching schedules: {str(e)}")
        return jsonify({"error": "Failed to fetch schedules"}), 500
    

# ------------------------------ Get a Schedule by Staff ID ------------------------------

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
    logger.info(f"Request received to fetch schedule for staff_id {staff_id}.")
    try:
        schedule = Schedule.query.filter_by(staff_id=staff_id).all()
        if schedule:
            logger.info(f"Fetched schedule for staff_id {staff_id}.")
            return jsonify([s.to_dict() for s in schedule]), 200
        logger.warning(f"Schedule for staff_id {staff_id} not found.")
        return jsonify([]), 200  # Return an empty array if not found
    except Exception as e:
        logger.error(f"Error fetching schedule: {str(e)}")
        return jsonify({"error": "Failed to fetch schedule"}), 500

# ------------------------------ Get Schedules by Department ------------------------------

@app.route('/schedules/department/<string:department>', methods=['GET'])
def get_schedules_by_department(department):
    """
    Get schedules by department
    ---
    parameters:
      - name: department
        in: path
        type: string
        required: true
        description: Department name
    responses:
      200:
        description: Schedules fetched successfully
      404:
        description: No schedules found for the department
      500:
        description: Failed to fetch schedules
    """
    logger.info(f"Request received to fetch schedules for department: {department}")
    try:
        schedules = Schedule.query.filter_by(department=department).all()
        if schedules:
            logger.info(f"Fetched {len(schedules)} schedules for department {department}.")
            return jsonify([s.to_dict() for s in schedules]), 200
        logger.warning(f"No schedules found for department {department}.")
        return jsonify({"message": "No schedules found for this department"}), 404
    except Exception as e:
        logger.error(f"Error fetching schedules for department {department}: {str(e)}")
        return jsonify({"error": "Failed to fetch schedules"}), 500

# ------------------------------ Get Team Schedules by Manager ID ------------------------------

@app.route('/schedules/manager/<int:manager_id>', methods=['GET'])
def get_team_schedules(manager_id):
    """
    Get schedules for a manager's team
    ---
    parameters:
      - name: manager_id
        in: path
        type: integer
        required: true
        description: The staff ID of the manager
    responses:
      200:
        description: Team schedules fetched successfully
      404:
        description: No team members found for this manager
      500:
        description: Failed to fetch team schedules
    """
    logger.info(f"Request received to fetch team schedules for manager_id {manager_id}.")
    try:
        # Fetch team members from micro_profile service
        profile_service_url = f"http://127.0.0.1:5002/managers/{manager_id}/team"
        response = requests.get(profile_service_url)
        if response.status_code != 200:
            logger.error(f"Failed to fetch team members from Profile service for manager_id {manager_id}.")
            return jsonify({"error": "Failed to fetch team members from Profile service"}), response.status_code

        team_members = response.json()
        team_staff_ids = [member['staff_id'] for member in team_members]

        if not team_staff_ids:
            logger.info(f"No team members found for manager_id {manager_id}.")
            return jsonify({"message": "No team members found for this manager."}), 404

        # Fetch schedules for team members
        team_schedules = Schedule.query.filter(Schedule.staff_id.in_(team_staff_ids)).all()
        logger.info(f"Fetched {len(team_schedules)} schedules for manager_id {manager_id}.")

        return jsonify([schedule.to_dict() for schedule in team_schedules]), 200

    except requests.exceptions.RequestException as req_err:
        logger.error(f"Error connecting to Profile service: {str(req_err)}")
        return jsonify({"error": f"Error connecting to Profile service: {str(req_err)}"}), 500
    except Exception as e:
        logger.error(f"Error fetching team schedules: {str(e)}")
        return jsonify({"error": "Failed to fetch team schedules"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
