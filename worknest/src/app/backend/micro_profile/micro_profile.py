from collections import defaultdict
import datetime
from flask import Flask, Request, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS

load_dotenv()


db_url = os.getenv("SQLALCHEMY_DATABASE_URI")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db =SQLAlchemy(app)

class Profile(db.Model):
    __tablename__ = "profile"
    
    staff_id = db.Column(db.Integer, primary_key=True)
    staff_fname = db.Column(db.String(50))
    staff_lname = db.Column(db.String(50))
    department = db.Column(db.String(50))
    position = db.Column(db.String(50))
    country = db.Column(db.String(50))
    location = db.Column(db.String(50),default = "OFFICE")
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
            'role': self.role,
            # Exclude or obfuscate sensitive data like passwords in the dictionary output
    }
    
def update_profile_location():
    # Get today's date
    today = datetime.today().strftime('%d-%m-%Y')

    # Query all approved WFH requests starting today
    approved_requests = Request.query.filter_by(status='approved').all()

    for request in approved_requests:
        # If the request's start_date matches today
        if request.start_date == today:
            # Find the profile related to the request
            profile = Profile.query.filter_by(dept=request.department).first()
            if profile:
                # Update the location to WFH
                profile.location = 'WFH'
                db.session.commit()

@app.route("/managers/<int:staff_id>", methods=['GET'])
def getManagers(staff_id):
    employee = Profile.query.filter_by(staff_id=staff_id).first()
    manager = Profile.query.filter_by(staff_id=employee.reporting_manager_id).first() #manager name
    if manager:
        
        return jsonify(
           {
            "reporting_manager_name": f"{manager.staff_fname} {manager.staff_lname}",
            "reporting_manager_id": manager.staff_id
            }
        )
    return jsonify(
        {
            "code": 404,
            "message": "Manager not found."
        }
    ), 404

# ---------------------------------- Get Manager's Team Members ----------------------------------
@app.route('/managers/<int:manager_id>/team', methods=['GET'])
def get_manager_team(manager_id):
    try:
        team_members = Profile.query.filter_by(reporting_manager_id=manager_id).all()
        team_members_data = [member.to_dict() for member in team_members]
        return jsonify(team_members_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    

@app.route("/profile", methods=['GET'])
def get_all_profiles():
    profiles = Profile.query.all()
    return jsonify([profile.to_dict() for profile in profiles])

@app.route("/login", methods=['POST'])
def authentication():
    email = request.json.get("email")
    password = request.json.get("password")
    user = Profile.query.filter_by(email=email,password=password).first()
    if user:
        return jsonify(
            {
                "code": 200,
                "data": {
                    "employee": user.to_dict(),
                    "department": user.department,
                    "position": user.position,
                    'role': user.role,
                    'staff_id': user.staff_id
                }
            }
        )
    return jsonify(
        {
            "code": 404,
            "message": "Employee not found."
        }
    ), 404
    
@app.route("/piechart", methods=['GET'])
def get_piechart_data():
    profiles = Profile.query.all()
    data = {"office": 0, "wfh": 0}  # Initialize office and wfh counts

    for profile in profiles:
        if profile.location == "OFFICE":
            data["office"] += 1
        else:
            data["wfh"] += 1

    piechart_data = [
        {"label": "Office", "value": data["office"]},
        {"label": "WFH", "value": data["wfh"]}
    ]

    return jsonify(piechart_data)

@app.route("/departments", methods=['GET'])
def get_departments():
    profiles = Profile.query.all()
    # Create a dictionary to ensure unique departments, with the first profile's staff_id, staff_name, and location
    department_list = []
    
    for profile in profiles:
        department_list.append({
            "staff_id": profile.staff_id,
            "department": profile.department,
            "staff_name": f"{profile.staff_fname} {profile.staff_lname}",
            "location": profile.location
        })

    return jsonify(department_list)
@app.route("/barchart", methods=['GET'])
def get_barchart_data():
    profiles = Profile.query.all()

    # Dictionary to store data by department
    data = defaultdict(lambda: {"WFH": 0, "OFFICE": 0})

    # Loop through profiles and count employees based on location
    for profile in profiles:
        if profile.location == 'WFH':
            data[profile.department]['WFH'] += 1
        elif profile.location == 'OFFICE':
            data[profile.department]['OFFICE'] += 1

    # Convert to list format for easy use in frontend charts
    departments = list(data.keys())
    wfh_data = [data[dept]['WFH'] for dept in departments]
    office_data = [data[dept]['OFFICE'] for dept in departments]

    return jsonify({
        "xLabels": departments,  # List of departments for x-axis
        "seriesData": [
            {"label": "WFH", "data": wfh_data},  # WFH counts for each department
            {"label": "OFFICE", "data": office_data},  # Office counts for each department
        ]
    })


if __name__ == '__main__':
    app.run(port=5002, debug=True)                

    