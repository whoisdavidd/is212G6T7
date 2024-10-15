from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests
import logging
from datetime import datetime, date
from flasgger import Swagger

load_dotenv()

db_url = os.getenv("SQLALCHEMY_DATABASE_URI")

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'default_secret_key')  # Use environment variable for security

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  # Replace with your frontend's URL

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Worknest1234!@worknest.cr0a4u0u8ytj.ap-southeast-1.rds.amazonaws.com:5432/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flasgger
swagger = Swagger(app)

class RequestModel(db.Model):
    __tablename__ = "request"
    request_id = db.Column(db.Integer, primary_key=True, nullable=False)
    staff_id = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    reporting_manager_id = db.Column(db.Integer)
    reporting_manager_name = db.Column(db.String(50))
    day_id = db.Column(db.Integer)
    recurring_days = db.Column(db.Integer)
    
    def __init__(self, request_id, staff_id, department, start_date, reason, duration, status, reporting_manager_id, reporting_manager_name, day_id, recurring_days):
        self.request_id = request_id
        self.staff_id = staff_id
        self.department = department
        self.start_date = start_date
        self.reason = reason
        self.duration = duration
        self.status = status
        self.reporting_manager_id = reporting_manager_id
        self.reporting_manager_name = reporting_manager_name
        self.day_id = day_id
        self.recurring_days = recurring_days
        
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
            'day_id': self.day_id,
            'recurring_days': self.recurring_days
        }


# ------------------------------ Get all requests ------------------------------

@app.route('/requests', methods=['GET'])
def get_all_requests():
    """
    Get all requests
    ---
    responses:
      200:
        description: A list of requests
        schema:
          type: array
          items:
            type: object
            properties:
              request_id:
                type: integer
              staff_id:
                type: integer
              department:
                type: string
              start_date:
                type: string
              reason:
                type: string
              duration:
                type: string
              status:
                type: string
              reporting_manager_id:
                type: integer
              reporting_manager_name:
                type: string
              day_id:
                type: integer
              recurring_days:
                type: integer
      500:
        description: Failed to fetch requests
    """
    try:
        requests = RequestModel.query.all()
        return jsonify([request.to_dict() for request in requests]), 200
    except Exception as e:
        logger.error(f"Error fetching requests: {str(e)}")
        return jsonify({'error': 'Failed to fetch requests'}), 500
    

# ------------------------------ Get all requests by staff_id ------------------------------

@app.route('/requests/<int:staff_id>', methods=['GET'])
def get_staff_requests(staff_id):
    """
    Get all requests by staff_id
    ---
    responses:
      200:
        description: A list of requests
        schema:
          type: array
          items:
            type: object
            properties:
              request_id:
                type: integer
              staff_id:
                type: integer
              department:
                type: string
              start_date:
                type: string
              reason:
                type: string
              duration:
                type: string
              status:
                type: string
              reporting_manager_id:
                type: integer
              reporting_manager_name:
                type: string
              day_id:
                type: integer
              recurring_days:
                type: integer
      500:
        description: Failed to fetch staff requests
    """
    try:
        staff_requests = RequestModel.query.filter_by(staff_id=staff_id).all()
        if not staff_requests:
            return jsonify({'message': 'No requests found for this staff member.'}), 404
        return jsonify([request.to_dict() for request in staff_requests]), 200
    except Exception as e:
        logger.error(f"Error fetching staff requests: {str(e)}")
        return jsonify({'error': 'Failed to fetch staff requests'}), 500
    


# ------------------------------ Get a request by request_id ------------------------------

@app.route('/requests/<int:request_id>', methods=['GET'])
def get_request(request_id):
    """
    Get a request by request_id
    ---
    responses:
      200:
        description: A request
        schema:
          type: object
          properties:
            request_id:
              type: integer
            staff_id:
              type: integer
            department:
              type: string
            start_date:
              type: string
            reason:
              type: string
            duration:
              type: string
            status:
              type: string
            reporting_manager_id:
              type: integer
            reporting_manager_name:
              type: string
            day_id:
              type: integer
            recurring_days:
              type: integer
      500:
        description: Failed to fetch request
    """
    try:
        request = RequestModel.query.get(request_id)
        if not request:
            return jsonify({'message': 'Request not found'}), 404
        return jsonify(request.to_dict()), 200
    except Exception as e:
        logger.error(f"Error fetching request: {str(e)}")
        return jsonify({'error': 'Failed to fetch request'}), 500
    

# ------------------------------ Get all requests by manager_id ------------------------------

@app.route('/manager_requests/<int:manager_id>', methods=['GET'])
def get_manager_requests(manager_id):
    """
    Get all requests by manager_id
    ---
    responses:
      200:
        description: A list of requests
        schema:
          type: array
          items:
            type: object
            properties:
              request_id:
                type: integer
              staff_id:
                type: integer
              department:
                type: string
              start_date:
                type: string
              reason:
                type: string
              duration:
                type: string
              status:
                type: string
              reporting_manager_id:
                type: integer
              reporting_manager_name:
                type: string
              day_id:
                type: integer
              recurring_days:
                type: integer
      500:
        description: Failed to fetch manager requests
    """
    try:
        profile_service_url = f"http://localhost:5002/managers/{manager_id}/team"
        response = requests.get(profile_service_url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch team members from Profile service"}), response.status_code

        team_members = response.json()
        team_staff_ids = [member['staff_id'] for member in team_members]

        if not team_staff_ids:
            return jsonify({"message": "No team members found for this manager."}), 200

        team_requests = RequestModel.query.filter(RequestModel.staff_id.in_(team_staff_ids)).all()
        team_requests_data = [request.to_dict() for request in team_requests]
        return jsonify(team_requests_data), 200

    except requests.exceptions.RequestException as req_err:
        logger.error(f"Error connecting to Profile service: {str(req_err)}")
        return jsonify({"error": f"Error connecting to Profile service: {str(req_err)}"}), 500
    except Exception as e:
        logger.error(f"Error fetching manager requests: {str(e)}")
        return jsonify({"error": str(e)}), 500
    


# ------------------------------ Add a request ------------------------------

@app.route('/requests', methods=['POST'])
def add_request():
    """
    Add a request
    ---
    responses:
      201:
        description: Request added successfully
        schema:
          type: object
          properties:
            request_id:
              type: integer
            staff_id:
              type: integer
            department:
              type: string
            start_date:
              type: string
            reason:
              type: string
            duration:
              type: string
            status:
              type: string
            reporting_manager_id:
              type: integer
            reporting_manager_name:
              type: string
      500:
        description: Failed to add request
    """
    try:
        data = request.get_json()
        new_request = RequestModel(
            staff_id=data['staff_id'],
            department=data['department'],
            start_date=data['start_date'],
            reason=data['reason'],
            duration=data['duration'],
            status=data['status'],
            reporting_manager_id=data['reporting_manager_id'],
            reporting_manager_name=data['reporting_manager_name']
        )
        db.session.add(new_request)
        db.session.commit()
        return jsonify(new_request.to_dict()), 201
    except Exception as e:
        logger.error(f"Error adding request: {str(e)}")
        return jsonify({'error': 'Failed to add request'}), 500
    

# ------------------------------ Withdraw a request ------------------------------

@app.route('/requests/<int:request_id>/withdraw', methods=['PUT'])
def withdraw_request(request_id):
    """
    Withdraw a request
    ---
    responses:
      200:
        description: Request withdrawn successfully
        schema:
          type: object
          properties:
            message:
              type: string
      500:
        description: Failed to withdraw request
    """
    try:
        role = request.headers.get('X-Role')
        client_staff_id = request.headers.get('X-Staff-ID')
        manager_department = request.headers.get('X-Department')

        if not role or not client_staff_id or not manager_department:
            return jsonify({'message': 'Missing authentication headers.'}), 400

        role = int(role)
        client_staff_id = int(client_staff_id)

        if role == 2:
            request_obj = RequestModel.query.filter_by(
                request_id=request_id, staff_id=client_staff_id, status='pending'
            ).first()
            if not request_obj:
                return jsonify({'message': 'Unauthorized to withdraw this request or request already processed.'}), 403
        elif role == 1:
            request_obj = RequestModel.query.filter_by(
                request_id=request_id, status='pending', department=manager_department
            ).first()
            if not request_obj:
                return jsonify({'message': 'Request not found, already processed, or not within your department.'}), 404
        else:
            return jsonify({'message': 'Invalid role.'}), 400

        request_obj.status = 'Withdrawn'
        db.session.commit()

        # Correct the endpoint URL
        schedule_update_url = "http://localhost:5004/schedules"
        schedule_update_data = {
            'staff_id': request_obj.staff_id,
            'date': request_obj.start_date,
            'department': request_obj.department,
            'status': request_obj.status
        }

        response = requests.post(schedule_update_url, json=schedule_update_data)
        if response.status_code != 200:
            logger.error(f"Schedule microservice responded with status code {response.status_code}")
            return jsonify({'message': 'Request withdrawn, but failed to update schedule.'}), 500

        return jsonify({'message': 'Request withdrawn successfully.'}), 200

    except Exception as e:
        logger.error(f"Error withdrawing request: {str(e)}")
        return jsonify({'message': 'Request withdrawn, but an error occurred while updating schedule.', 'error': str(e)}), 500



# ------------------------------ Cancel a request ------------------------------

@app.route('/requests/<int:request_id>/cancel', methods=['PUT'])
def cancel_request(request_id):
    """
    Cancel a request
    ---
    responses:
      200:
        description: Request canceled successfully
        schema:
          type: object
          properties:
            message:
              type: string
      500:
        description: Failed to cancel request
    """
    try:
        role = request.headers.get('X-Role')
        client_staff_id = request.headers.get('X-Staff-ID')
        manager_department = request.headers.get('X-Department')

        if not role or not client_staff_id or not manager_department:
            return jsonify({'message': 'Missing authentication headers.'}), 400

        role = int(role)
        client_staff_id = int(client_staff_id)

        # Use Session.get() instead of Query.get()
        with db.session() as session:
            request_obj = session.get(RequestModel, request_id)
            if not request_obj:
                return jsonify({'message': 'Unauthorized to cancel this request or request already processed.'}), 403

            if role == 1 and request_obj.department != manager_department:
                return jsonify({'message': 'Request not found, already processed, or not within your department.'}), 404

            request_obj.status = 'Cancelled'
            session.commit()

            # Correct the endpoint URL
            schedule_update_url = "http://localhost:5004/schedules"
            schedule_update_data = {
                'staff_id': request_obj.staff_id,
                'date': request_obj.start_date if isinstance(request_obj.start_date, str) else request_obj.start_date.isoformat(),
                'department': request_obj.department,
                'status': request_obj.status
            }

            response = requests.post(schedule_update_url, json=schedule_update_data)
            if response.status_code != 200:
                logger.error(f"Schedule microservice responded with status code {response.status_code}")
                return jsonify({'message': 'Request canceled, but failed to update schedule.'}), 500

            return jsonify({'message': 'Request canceled successfully.'}), 200

    except Exception as e:
        logger.error(f"Error canceling request: {str(e)}")
        return jsonify({'message': 'Request canceled, but an error occurred while updating schedule.', 'error': str(e)}), 500



# ------------------------------ Update a request ------------------------------

@app.route('/requests/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    """
    Update a request
    ---
    responses:
      200:
        description: Request updated successfully
        schema:
          type: object
          properties:
            message:
              type: string
            request:
              type: object
              properties:
                request_id:
                  type: integer
                staff_id:
                  type: integer
                department:
                  type: string
                start_date:
                  type: string
                reason:
                  type: string
                duration:
                  type: string
                status:
                  type: string
      500:
        description: Failed to update request
    """
    try:
        role = request.headers.get('X-Role')
        client_staff_id = request.headers.get('X-Staff-ID')
        client_department = request.headers.get('X-Department')

        if not role or not client_staff_id or not client_department:
            return jsonify({'message': 'Missing authentication headers.'}), 400

        role = int(role)
        client_staff_id = int(client_staff_id)

        request_obj = RequestModel.query.get(request_id)
        if not request_obj:
            return jsonify({'message': 'Request not found.'}), 404

        if role == 2 and request_obj.staff_id != client_staff_id:
            return jsonify({'message': 'Unauthorized to update this request.'}), 403
        elif role == 1 and request_obj.department != client_department:
            return jsonify({'message': 'Unauthorized to update request from different department.'}), 403

        data = request.get_json()
        request_obj.start_date = data['start_date']
        request_obj.duration = data['duration']
        request_obj.reason = data['reason']

        if request_obj.status == 'Approved' and data.get('status') == 'Pending':
            request_obj.status = 'Pending'

        db.session.commit()
        return jsonify({'message': 'Request updated successfully.', 'request': request_obj.to_dict()}), 200

    except Exception as e:
        logger.error(f"Error updating request: {str(e)}")
        db.session.rollback()
        return jsonify({'message': f'Error updating request: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(port=5003, debug=True)