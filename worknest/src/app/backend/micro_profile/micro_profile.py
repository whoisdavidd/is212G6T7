from collections import defaultdict
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
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flasgger
swagger = Swagger(app)

class Profile(db.Model):
    __tablename__ = "profile"
    
    staff_id = db.Column(db.Integer, primary_key=True)
    staff_fname = db.Column(db.String(50))
    staff_lname = db.Column(db.String(50))
    department = db.Column(db.String(50))
    position = db.Column(db.String(50))
    country = db.Column(db.String(50))
    location = db.Column(db.String(50), default="OFFICE")
    email = db.Column(db.String(50))
    reporting_manager_id = db.Column(db.Integer)
    role = db.Column(db.Integer)
    password = db.Column(db.String(50))
    
    def to_dict(self):
        return {
            'staff_id': self.staff_id,
            'staff_fname': self.staff_fname,
            'staff_lname': self.staff_lname,
            'department': self.department,
            'position': self.position,
            'country': self.country,
            'location': self.location,
            'email': self.email,
            'reporting_manager_id': self.reporting_manager_id,
            'role': self.role
        }


# ------------------------------ Get employee profile ------------------------------

@app.route("/profile/<int:staff_id>", methods=['GET'])
def get_employee_profile(staff_id):
    """
    Get employee profile by staff ID
    ---
    parameters:
      - name: staff_id
        in: path
        type: integer
        required: true
        description: The staff ID of the employee
    responses:
      200:
        description: Employee profile
        schema:
          type: object
          properties:
            staff_id:
              type: integer
            staff_fname:
              type: string
            staff_lname:
              type: string
            department:
              type: string
            position:
              type: string
            country:
              type: string
            location:
              type: string
            email:
              type: string
            reporting_manager_id:
              type: integer
            role:
              type: integer
      404:
        description: Employee not found
      500:
        description: Failed to fetch employee profile
    """
    try:
        employee = Profile.query.filter_by(staff_id=staff_id).first()
        if not employee:
            return jsonify({"message": "Employee not found."}), 404
        return jsonify(employee.to_dict()), 200
    except Exception as e:
        logger.error(f"Error fetching employee profile: {str(e)}")
        return jsonify({"error": "Failed to fetch employee profile"}), 500


# ------------------------------ Get manager details ------------------------------

@app.route("/managers/<int:staff_id>", methods=['GET'])
def get_managers(staff_id):
    """
    Get manager details by staff ID
    ---
    parameters:
      - name: staff_id
        in: path
        type: integer
        required: true
        description: The staff ID of the employee
    responses:
      200:
        description: Manager details
        schema:
          type: object
          properties:
            reporting_manager_name:
              type: string
            reporting_manager_id:
              type: integer
      404:
        description: Manager not found
      500:
        description: Failed to fetch manager details
    """
    try:
        employee = Profile.query.filter_by(staff_id=staff_id).first()
        manager = Profile.query.filter_by(staff_id=employee.reporting_manager_id).first()
        if manager:
            return jsonify({
                "reporting_manager_name": f"{manager.staff_fname} {manager.staff_lname}",
                "reporting_manager_id": manager.staff_id
            }), 200
        return jsonify({"message": "Manager not found."}), 404
    except Exception as e:
        logger.error(f"Error fetching manager details: {str(e)}")
        return jsonify({"error": "Failed to fetch manager details"}), 500

@app.route('/managers/<int:manager_id>/team', methods=['GET'])
def get_manager_team(manager_id):
    """
    Get manager's team by manager ID
    ---
    parameters:
      - name: manager_id
        in: path
        type: integer
        required: true
        description: The staff ID of the manager
    responses:
      200:
        description: Manager's team
        schema:
          type: array
          items:
            type: object
            properties:
              staff_id:
                type: integer
              staff_fname:
                type: string
              staff_lname:
                type: string
              department:
                type: string
              position:
                type: string
              location:
                type: string
      404:
        description: Manager not found
      500:
        description: Failed to fetch manager's team
    """
    try:
        team_members = Profile.query.filter_by(reporting_manager_id=manager_id).all()
        team_members_data = [member.to_dict() for member in team_members]
        return jsonify(team_members_data), 200
    except Exception as e:
        logger.error(f"Error fetching manager's team: {str(e)}")
        return jsonify({"error": "Failed to fetch manager's team"}), 500


# ------------------------------ Get all profiles ------------------------------

@app.route("/profile", methods=['GET'])
def get_all_profiles():
    """
    Get all profiles
    ---
    responses:
      200:
        description: All profiles
        schema:
          type: array
          items:
            type: object
            properties:
              staff_id:
                type: integer
              staff_fname:
                type: string
              staff_lname:
                type: string
              department:
                type: string
              position:
                type: string
              location:
                type: string
      500:
        description: Failed to fetch profiles
    """
    try:
        profiles = Profile.query.all()
        return jsonify([profile.to_dict() for profile in profiles]), 200
    except Exception as e:
        logger.error(f"Error fetching profiles: {str(e)}")
        return jsonify({"error": "Failed to fetch profiles"}), 500


# ------------------------------ Authentication ------------------------------

@app.route("/login", methods=['POST'])
def authentication():
    """
    Authenticate user
    ---
    parameters:
      - name: email
        in: body
        type: string
        required: true
        description: The email of the user
      - name: password
        in: body
        type: string
        required: true
        description: The password of the user
    responses:
      200:
        description: User authenticated
        schema:
          type: object
          properties:
            code:
              type: integer
            data:
              type: object
              properties:
                employee:
                  type: object
                department:
                  type: string
                position:
                  type: string
                role:
                  type: integer
                staff_id:
                  type: integer
      401:
        description: Invalid credentials
      500:
        description: Authentication failed
    """
    try:
        email = request.json.get("email")
        password = request.json.get("password")
        user = Profile.query.filter_by(email=email, password=password).first()
        if user:
            return jsonify({
                "code": 200,
                "data": {
                    "employee": user.to_dict(),
                    "department": user.department,
                    "position": user.position,
                    'role': user.role,
                    'staff_id': user.staff_id
                }
            }), 200
        return jsonify({"code": 401, "message": "Invalid credentials."}), 401
    except Exception as e:
        logger.error(f"Error during authentication: {str(e)}")
        return jsonify({"error": "Authentication failed"}), 500



# ------------------------------ Pie chart ------------------------------

@app.route("/piechart", methods=['GET'])
def get_piechart_data():
    """
    Get pie chart data
    ---
    responses:
      200:
        description: Pie chart data
        schema:
          type: array
          items:
            type: object
            properties:
              label:
                type: string
              value:
                type: integer
      500:
        description: Failed to fetch pie chart data
    """
    try:
        profiles = Profile.query.all()
        data = {"office": 0, "wfh": 0}

        for profile in profiles:
            if profile.location == "OFFICE":
                data["office"] += 1
            else:
                data["wfh"] += 1

        piechart_data = [
            {"label": "Office", "value": data["office"]},
            {"label": "WFH", "value": data["wfh"]}
        ]

        return jsonify(piechart_data), 200
    except Exception as e:
        logger.error(f"Error fetching pie chart data: {str(e)}")
        return jsonify({"error": "Failed to fetch pie chart data"}), 500



# ------------------------------ Bar chart ------------------------------

@app.route("/departments", methods=['GET'])
def get_departments():
    """
    Get all departments
    ---
    responses:
      200:
        description: All departments
        schema:
          type: array
          items:
            type: object
            properties:
              staff_id:
                type: integer
              department:
                type: string
              staff_name:
                type: string
              location:
                type: string
      500:
        description: Failed to fetch departments
    """
    try:
        profiles = Profile.query.all()
        department_list = []

        for profile in profiles:
            department_list.append({
                "staff_id": profile.staff_id,
                "department": profile.department,
                "staff_name": f"{profile.staff_fname} {profile.staff_lname}",
                "location": profile.location
            })

        return jsonify(department_list), 200
    except Exception as e:
        logger.error(f"Error fetching departments: {str(e)}")
        return jsonify({"error": "Failed to fetch departments"}), 500



# ------------------------------ Bar chart ------------------------------
@app.route("/barchart", methods=['GET'])
def get_barchart_data():
    """
    Get bar chart data
    ---
    responses:
      200:
        description: Bar chart data
        schema:
          type: object
          properties:
            xLabels:
              type: array
              items:
                type: string
            seriesData:
              type: array
              items:
                type: object
                properties:
                  label:
                    type: string
                  data:
                    type: array
                    items:
                      type: integer
      500:
        description: Failed to fetch bar chart data
    """
    try:
        profiles = Profile.query.all()
        data = defaultdict(lambda: {"WFH": 0, "OFFICE": 0})

        for profile in profiles:
            if profile.location == 'WFH':
                data[profile.department]['WFH'] += 1
            elif profile.location == 'OFFICE':
                data[profile.department]['OFFICE'] += 1

        departments = list(data.keys())
        wfh_data = [data[dept]['WFH'] for dept in departments]
        office_data = [data[dept]['OFFICE'] for dept in departments]

        return jsonify({
            "xLabels": departments,
            "seriesData": [
                {"label": "WFH", "data": wfh_data},
                {"label": "OFFICE", "data": office_data},
            ]
        }), 200
    except Exception as e:
        logger.error(f"Error fetching bar chart data: {str(e)}")
        return jsonify({"error": "Failed to fetch bar chart data"}), 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)
