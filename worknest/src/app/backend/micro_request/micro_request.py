from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests
import logging
from datetime import datetime, date, timedelta
from flasgger import Swagger

load_dotenv()

db_url = os.getenv("SQLALCHEMY_DATABASE_URI")

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'default_secret_key')  # Use environment variable for security

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])  # Replace with your frontend's URL

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flasgger
swagger = Swagger(app)

class RequestModel(db.Model):
    __tablename__ = "request"
    request_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    staff_id = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    duration = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    reporting_manager_id = db.Column(db.Integer)
    reporting_manager_name = db.Column(db.String(50))
    reporting_manager_email = db.Column(db.String(50))
    requester_email = db.Column(db.String(50))
    day_id = db.Column(db.Integer)
    recurring_days = db.Column(db.Integer)
    approver_comment = db.Column(db.String(255))
    
    def __init__(self, staff_id, department, start_date, reason, duration, status, reporting_manager_id, reporting_manager_name, reporting_manager_email, requester_email, day_id, recurring_days, approver_comment):
        self.staff_id = staff_id
        self.department = department
        self.start_date = start_date
        self.reason = reason
        self.duration = duration
        self.status = status
        self.reporting_manager_id = reporting_manager_id
        self.reporting_manager_name = reporting_manager_name
        self.reporting_manager_email = reporting_manager_email
        self.requester_email = requester_email
        self.day_id = day_id
        self.recurring_days = recurring_days
        self.approver_comment = approver_comment
        
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
            'reporting_manager_email': self.reporting_manager_email,
            'requester_email': self.requester_email,
            'day_id': self.day_id,
            'recurring_days': self.recurring_days,
            'approver_comment': self.approver_comment
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
    logger.info("[GET] /requests - Received request to fetch all requests.")
    try:
        requests = RequestModel.query.all()
        logger.info(f"[GET] /requests - Successfully fetched {len(requests)} requests.")
        return jsonify([request.to_dict() for request in requests]), 200
    except Exception as e:
        logger.error(f"[GET] /requests - Error fetching requests: {str(e)}")
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
    logger.info(f"[GET] /requests/{staff_id} - Received request to fetch requests for staff_id {staff_id}.")
    try:
        staff_requests = RequestModel.query.filter_by(staff_id=staff_id).all()
        if not staff_requests:
            logger.warning(f"[GET] /requests/{staff_id} - No requests found for staff_id {staff_id}.")
            return jsonify({'message': 'No requests found for this staff member.'}), 404
        logger.info(f"[GET] /requests/{staff_id} - Successfully fetched {len(staff_requests)} requests for staff_id {staff_id}.")
        return jsonify([request.to_dict() for request in staff_requests]), 200
    except Exception as e:
        logger.error(f"[GET] /requests/{staff_id} - Error fetching staff requests: {str(e)}")
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
    logger.info(f"[GET] /requests/{request_id} - Received request to fetch request with request_id {request_id}.")
    try:
        request_obj = RequestModel.query.get(request_id)
        if not request_obj:
            logger.warning(f"[GET] /requests/{request_id} - Request with request_id {request_id} not found.")
            return jsonify({'message': 'Request not found'}), 404
        logger.info(f"[GET] /requests/{request_id} - Successfully fetched request with request_id {request_id}.")
        return jsonify(request_obj.to_dict()), 200
    except Exception as e:
        logger.error(f"[GET] /requests/{request_id} - Error fetching request: {str(e)}")
        return jsonify({'error': 'Failed to fetch request'}), 500
    

# ------------------------------ Get all requests by manager_id ------------------------------

@app.route('/manager_requests/<int:manager_id>', methods=['GET'])
def get_manager_requests(manager_id):
    """
    Get all requests by manager_id
    ---
    responses:
      200:
        description: A list of requests with staff details
        schema:
          type: array
          items:
            type: object
            properties:
              request_id:
                type: integer
              staff_id:
                type: integer
              staff_name:
                type: string
              role:
                type: string
              work_location:
                type: string
              from_date:
                type: string
              to_date:
                type: string
              status:
                type: string
      500:
        description: Failed to fetch manager requests
    """
    logger.info(f"[GET] /manager_requests/{manager_id} - Received request to fetch requests for manager_id {manager_id}.")
    try:
        profile_service_url = f"http://localhost:5002/managers/{manager_id}/team"
        response = requests.get(profile_service_url)
        if response.status_code != 200:
            logger.error(f"[GET] /manager_requests/{manager_id} - Failed to fetch team members from Profile service for manager_id {manager_id}.")
            return jsonify({"error": "Failed to fetch team members from Profile service"}), response.status_code

        team_members = response.json()
        team_staff_ids = [member['staff_id'] for member in team_members]

        if not team_staff_ids:
            logger.info(f"[GET] /manager_requests/{manager_id} - No team members found for manager_id {manager_id}.")
            return jsonify({"message": "No team members found for this manager."}), 200

        team_requests = RequestModel.query.filter(RequestModel.staff_id.in_(team_staff_ids)).all()
        logger.info(f"[GET] /manager_requests/{manager_id} - Successfully fetched {len(team_requests)} requests for manager_id {manager_id}.")

        team_requests_data = []
        for request in team_requests:
            staff_profile = next((member for member in team_members if member['staff_id'] == request.staff_id), None)
            if staff_profile:
                from_date = datetime.strptime(request.start_date, '%Y-%m-%d')
                to_date = calculate_to_date(from_date, request.duration)
                team_requests_data.append({
                    'request_id': request.request_id,
                    'staff_id': request.staff_id,
                    'staff_name': f"{staff_profile['staff_fname']} {staff_profile['staff_lname']}",
                    'role': staff_profile['position'],
                    'work_location': request.reason,
                    'from_date': request.start_date,
                    'to_date': to_date.strftime('%Y-%m-%d'),
                    'status': request.status
                })

        logger.info(f"[GET] /manager_requests/{manager_id} - Team requests data: {team_requests_data}")
        return jsonify(team_requests_data), 200

    except requests.exceptions.RequestException as req_err:
        logger.error(f"[GET] /manager_requests/{manager_id} - Error connecting to Profile service: {str(req_err)}")
        return jsonify({"error": f"Error connecting to Profile service: {str(req_err)}"}), 500
    except Exception as e:
        logger.error(f"[GET] /manager_requests/{manager_id} - Error fetching manager requests: {str(e)}")
        return jsonify({"error": str(e)}), 500

def calculate_to_date(from_date, duration):
    try:
        if 'day' in duration:
            days = int(duration.split()[0])
            return from_date + timedelta(days=days)
        elif 'hour' in duration:
            hours = int(duration.split()[0])
            return from_date + timedelta(hours=hours)
        else:
            logger.warning(f"[CALCULATE] - Unknown duration format: {duration}")
            return from_date
    except Exception as e:
        logger.error(f"[CALCULATE] - Error calculating to_date: {str(e)}")
        return from_date


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
              type: integer
            status:
              type: string
            reporting_manager_id:
              type: integer
            reporting_manager_name:
              type: string
            reporting_manager_email:
              type: string
            requester_email:
              type: string
            day_id:
              type: integer
            recurring_days:
              type: array
              items:
                type: integer
            approver_comment:
              type: string
      500:
        description: Failed to add request
    """
    logger.info("[POST] /requests - Received request to add a new request.")
    try:
        data = request.get_json()
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        duration = (end_date - start_date).days

        if duration < 0:
            logger.warning("[POST] /requests - End date is before start date.")
            return jsonify({'error': 'End date must be after start date.'}), 400

        # Ensure recurring_days is an array
        recurring_days = data.get('recurring_days', [])
        if isinstance(recurring_days, int):
            recurring_days = [recurring_days]

        # Check for missing keys and provide defaults if necessary
        reporting_manager_email = data.get('reporting_manager_email', '')
        requester_email = data.get('requester_email', '')

        new_request = RequestModel(
            staff_id=data['staff_id'],
            department=data['department'],
            start_date=data['start_date'],
            reason=data['reason'],
            duration=duration,
            status='Pending',
            reporting_manager_id=data['reporting_manager_id'],
            reporting_manager_name=data['reporting_manager_name'],
            reporting_manager_email=reporting_manager_email,
            requester_email=requester_email,
            day_id=data.get('day_id', 0),
            recurring_days=recurring_days,
            approver_comment=data.get('approver_comment', '')
        )
        db.session.add(new_request)
        db.session.commit()
        logger.info(f"[POST] /requests - Successfully added new request for staff_id {data['staff_id']}.")
        return jsonify(new_request.to_dict()), 201
    except KeyError as ke:
        logger.error(f"[POST] /requests - Missing key: {str(ke)}")
        return jsonify({'error': f'Missing key: {str(ke)}'}), 400
    except ValueError as ve:
        logger.error(f"[POST] /requests - Date format error: {str(ve)}")
        return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD.'}), 400
    except Exception as e:
        logger.error(f"[POST] /requests - Error adding request: {str(e)}")
        return jsonify({'error': 'Failed to add request'}), 500
    

# ------------------------------ Withdraw a request ------------------------------

@app.route('/requests/<int:request_id>/withdraw', methods=['PUT'])
def withdraw_request(request_id):
    logger.info(f"[PUT] /requests/{request_id}/withdraw - Received request to withdraw request with request_id {request_id}.")
    try:
        role = request.headers.get('X-Role')
        client_staff_id = request.headers.get('X-Staff-ID')
        manager_department = request.headers.get('X-Department')

        if not role or not client_staff_id or not manager_department:
            logger.warning(f"[PUT] /requests/{request_id}/withdraw - Missing authentication headers.")
            return jsonify({'message': 'Missing authentication headers.'}), 400

        role = int(role)
        client_staff_id = int(client_staff_id)

        request_obj = RequestModel.query.get(request_id)
        if not request_obj:
            logger.warning(f"[PUT] /requests/{request_id}/withdraw - Request with request_id {request_id} not found.")
            return jsonify({'message': 'Request not found.'}), 404

        # Authorization logic
        if (role == 2 and request_obj.staff_id == client_staff_id) or \
           (role == 1 and request_obj.reporting_manager_id == client_staff_id) or \
           (role == 1 and request_obj.department == manager_department) or \
           (role == 3):  # HR can withdraw any request
            request_obj.status = 'Withdrawn'
            db.session.commit()

            schedule_update_url = "http://localhost:5004/schedules"
            schedule_update_data = {
                'staff_id': request_obj.staff_id,
                'date': request_obj.start_date,
                'department': request_obj.department,
                'status': request_obj.status
            }

            response = requests.post(schedule_update_url, json=schedule_update_data)
            if response.status_code != 200:
                logger.error(f"[PUT] /requests/{request_id}/withdraw - Schedule microservice responded with status code {response.status_code}")
                return jsonify({'message': 'Request withdrawn, but failed to update schedule.'}), 500

            logger.info(f"[PUT] /requests/{request_id}/withdraw - Successfully withdrawn request with request_id {request_id}.")
            return jsonify({'message': 'Request withdrawn successfully.'}), 200
        else:
            logger.warning(f"[PUT] /requests/{request_id}/withdraw - Unauthorized withdrawal attempt for request_id {request_id}.")
            return jsonify({'message': 'Unauthorized to withdraw this request.'}), 403

    except Exception as e:
        logger.error(f"[PUT] /requests/{request_id}/withdraw - Error withdrawing request: {str(e)}")
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
    logger.info(f"[PUT] /requests/{request_id}/cancel - Received request to cancel request with request_id {request_id}.")
    try:
        role = request.headers.get('X-Role')
        client_staff_id = request.headers.get('X-Staff-ID')
        manager_department = request.headers.get('X-Department')

        if not role or not client_staff_id or not manager_department:
            logger.warning(f"[PUT] /requests/{request_id}/cancel - Missing authentication headers.")
            return jsonify({'message': 'Missing authentication headers.'}), 400

        role = int(role)
        client_staff_id = int(client_staff_id)

        request_obj = RequestModel.query.get(request_id)
        if not request_obj:
            logger.warning(f"[PUT] /requests/{request_id}/cancel - Request with request_id {request_id} not found.")
            return jsonify({'message': 'Request not found.'}), 404

        # Authorization logic
        if (role == 2 and request_obj.staff_id == client_staff_id) or \
           (role == 3 and request_obj.reporting_manager_id == client_staff_id) or \
           (role == 1 and request_obj.department == manager_department) or \
           (role == 0):  # Assuming role 0 is the top-level manager
            request_obj.status = 'Cancelled'
            db.session.commit()

            schedule_update_url = "http://localhost:5004/schedules"
            schedule_update_data = {
                'staff_id': request_obj.staff_id,
                'date': request_obj.start_date if isinstance(request_obj.start_date, str) else request_obj.start_date.isoformat(),
                'department': request_obj.department,
                'status': request_obj.status
            }

            response = requests.post(schedule_update_url, json=schedule_update_data)
            if response.status_code != 200:
                logger.error(f"[PUT] /requests/{request_id}/cancel - Schedule microservice responded with status code {response.status_code}")
                return jsonify({'message': 'Request canceled, but failed to update schedule.'}), 500

            logger.info(f"[PUT] /requests/{request_id}/cancel - Successfully canceled request with request_id {request_id}.")
            return jsonify({'message': 'Request canceled successfully.'}), 200
        else:
            logger.warning(f"[PUT] /requests/{request_id}/cancel - Unauthorized cancellation attempt for request_id {request_id}.")
            return jsonify({'message': 'Unauthorized to cancel this request.'}), 403

    except Exception as e:
        logger.error(f"[PUT] /requests/{request_id}/cancel - Error canceling request: {str(e)}")
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
    logger.info(f"[PUT] /requests/{request_id} - Received request to update request with request_id {request_id}.")
    try:
        role = request.headers.get('X-Role')
        client_staff_id = request.headers.get('X-Staff-ID')
        client_department = request.headers.get('X-Department')

        if not role or not client_staff_id or not client_department:
            logger.warning(f"[PUT] /requests/{request_id} - Missing authentication headers.")
            return jsonify({'message': 'Missing authentication headers.'}), 400

        role = int(role)
        client_staff_id = int(client_staff_id)

        request_obj = RequestModel.query.get(request_id)
        if not request_obj:
            logger.warning(f"[PUT] /requests/{request_id} - Request with request_id {request_id} not found.")
            return jsonify({'message': 'Request not found.'}), 404

        # Authorization logic
        if (role == 2 and request_obj.staff_id == client_staff_id) or \
           (role == 3 and request_obj.reporting_manager_id == client_staff_id) or \
           (role == 1 and request_obj.department == client_department) or \
           (role == 0):  # Assuming role 0 is the top-level manager
            data = request.get_json()
            request_obj.start_date = data['start_date']
            request_obj.duration = data['duration']
            request_obj.reason = data['reason']

            if request_obj.status == 'Approved' and data.get('status') == 'Pending':
                request_obj.status = 'Pending'

            db.session.commit()
            logger.info(f"[PUT] /requests/{request_id} - Successfully updated request with request_id {request_id}.")
            return jsonify({'message': 'Request updated successfully.', 'request': request_obj.to_dict()}), 200
        else:
            logger.warning(f"[PUT] /requests/{request_id} - Unauthorized update attempt for request_id {request_id}.")
            return jsonify({'message': 'Unauthorized to update this request.'}), 403

    except Exception as e:
        logger.error(f"[PUT] /requests/{request_id} - Error updating request: {str(e)}")
        db.session.rollback()
        return jsonify({'message': f'Error updating request: {str(e)}'}), 500

# Helper function to check if a manager is a direct manager or superior
def is_manager_or_superior(manager_id, staff_id):
    # Implement logic to check if the manager_id is a direct manager or superior of staff_id
    # This might involve querying a database or another service
    return True  # Placeholder logic

if __name__ == '__main__':
    app.run(port=5003, debug=True)
