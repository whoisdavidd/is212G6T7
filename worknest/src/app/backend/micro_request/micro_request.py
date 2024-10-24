from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
import requests
import logging
from datetime import datetime, date, timedelta
from flasgger import Swagger

load_dotenv()

# Constants for configuration
DB_URL = os.getenv("SQLALCHEMY_DATABASE_URI")
SECRET_KEY = os.getenv('SECRET_KEY', 'supersecretkey')  # Replace with a secure key or use an environment variable

app = Flask(__name__)
app.secret_key = SECRET_KEY

CORS(app)  # Replace with your frontend's URL

app.config['SQLALCHEMY_DATABASE_URI'] = DB_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flasgger
swagger = Swagger(app)

class RequestModel(db.Model):
    __tablename__ = "request"
    request_id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    staff_id = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    reason = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    reporting_manager_id = db.Column(db.Integer, nullable=False)
    reporting_manager_name = db.Column(db.String(50), nullable=False)
    reporting_manager_email = db.Column(db.String(50), nullable=False)
    requester_email = db.Column(db.String(50), nullable=False)
    approver_comment = db.Column(db.String(50))
    requested_dates = db.Column(db.ARRAY(db.Date))
    time_of_day = db.Column(db.String(10), default='Full Day')

    def __init__(self, staff_id, department, reason, status, reporting_manager_id, reporting_manager_name, reporting_manager_email, requester_email, approver_comment=None, requested_dates=None, time_of_day='Full Day'):
        self.staff_id = staff_id
        self.department = department
        self.reason = reason
        self.status = status
        self.reporting_manager_id = reporting_manager_id
        self.reporting_manager_name = reporting_manager_name
        self.reporting_manager_email = reporting_manager_email
        self.requester_email = requester_email
        self.approver_comment = approver_comment
        self.requested_dates = requested_dates
        self.time_of_day = time_of_day

    def to_dict(self):
        return {
            'request_id': self.request_id,
            'staff_id': self.staff_id,
            'department': self.department,
            'reason': self.reason,
            'status': self.status,
            'reporting_manager_id': self.reporting_manager_id,
            'reporting_manager_name': self.reporting_manager_name,
            'reporting_manager_email': self.reporting_manager_email,
            'requester_email': self.requester_email,
            'approver_comment': self.approver_comment,
            'requested_dates': self.requested_dates,
            'time_of_day': self.time_of_day
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
        requested_dates = data['requested_dates']
        if not requested_dates or not all(isinstance(date, str) for date in requested_dates):
            return jsonify({'error': 'Invalid date format. Use an array of YYYY-MM-DD strings.'}), 400

        new_request = RequestModel(
            staff_id=data['staff_id'],
            department=data['department'],
            reason=data['reason'],
            status='Pending',
            reporting_manager_id=data['reporting_manager_id'],
            reporting_manager_name=data['reporting_manager_name'],
            reporting_manager_email=data.get('reporting_manager_email', ''),
            requester_email=data.get('requester_email', ''),
            approver_comment=data.get('approver_comment', ''),
            requested_dates=requested_dates
        )
        db.session.add(new_request)
        db.session.commit()
        logger.info(f"[POST] /requests - Successfully added new request for staff_id {data['staff_id']}.")
        return jsonify(new_request.to_dict()), 201
    except KeyError as ke:
        logger.error(f"[POST] /requests - Missing key: {str(ke)}")
        return jsonify({'error': f'Missing key: {str(ke)}'}), 400
    except Exception as e:
        logger.error(f"[POST] /requests - Error adding request: {str(e)}")
        return jsonify({'error': 'Failed to add request'}), 500


# ------------------------------ Get all requests by staff_id ------------------------------

@app.route('/staffRequests/<int:staff_id>', methods=['GET'])
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
            return jsonify([]), 200  # Return an empty array
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

@app.route('/requests/manager/<int:manager_id>', methods=['GET'])
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
              requested_dates:
                type: array
                items:
                  type: string
              time_of_day:
                type: string
              status:
                type: string
      500:
        description: Failed to fetch manager requests
    """
    logger.info(f"[GET] /manager_requests/{manager_id} - Received request to fetch requests for manager_id {manager_id}.")
    try:
        # profile_service_url = "http://localhost:5002/managers/{manager_id}/team"
        
        #comment above and use below url when using docker    
        profile_service_url = f"http://micro_profile:5000/managers/{manager_id}/team"
        response = requests.get(profile_service_url)
        if response.status_code != 200:
            logger.error(f"[GET] /requests/manager/{manager_id} - Failed to fetch team members from Profile service for manager_id {manager_id}.")
            return jsonify({"error": "Failed to fetch team members from Profile service"}), response.status_code

        team_members = response.json()
        team_staff_ids = [member['staff_id'] for member in team_members]

        if not team_staff_ids:
            logger.info(f"[GET] /requests/manager/{manager_id} - No team members found for manager_id {manager_id}.")
            return jsonify({"message": "No team members found for this manager."}), 200

        team_requests = RequestModel.query.filter(RequestModel.staff_id.in_(team_staff_ids)).all()
        logger.info(f"[GET] /requests/manager/{manager_id} - Successfully fetched {len(team_requests)} requests for manager_id {manager_id}.")

        team_requests_data = []
        logger.info(f"[GET] /requests/manager/{manager_id} - Team requests: {team_requests}")
        for request in team_requests:
            logger.info(f"[GET] /requests/manager/{manager_id} - Request: {request}")
            staff_profile = next((member for member in team_members if member['staff_id'] == request.staff_id), None)
            if staff_profile:
                team_requests_data.append({
                    'request_id': request.request_id,
                    'staff_id': request.staff_id,
                    'staff_name': f"{staff_profile['staff_fname']} {staff_profile['staff_lname']}",
                    'department': staff_profile['department'],
                    'reason': request.reason,
                    'role': staff_profile['position'],
                    'work_location': request.reason,
                    'requested_dates': [date.strftime('%Y-%m-%d') for date in request.requested_dates] if request.requested_dates else [],
                    'time_of_day': request.time_of_day,
                    'status': request.status
                })

        logger.info(f"[GET] /requests/manager/{manager_id} - Team requests data: {team_requests_data}")
        return jsonify(team_requests_data), 200

    except requests.exceptions.RequestException as req_err:
        logger.error(f"[GET] /requests/manager/{manager_id} - Error connecting to Profile service: {str(req_err)}")
        return jsonify({"error": f"Error connecting to Profile service: {str(req_err)}"}), 500
    except Exception as e:
        logger.error(f"[GET] /requests/manager/{manager_id} - Error fetching manager requests: {str(e)}")
        return jsonify({"error": str(e)}), 500

def calculate_to_date(from_date, duration):
    try:
            return from_date + timedelta(days=duration)
    except Exception as e:
        logger.error(f"[CALCULATE] - Error calculating to_date: {str(e)}")
        return from_date


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


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5003, debug=True)  

# port 5003