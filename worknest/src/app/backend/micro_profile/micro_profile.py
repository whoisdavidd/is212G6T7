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

@app.route("/mangers/<int:staff_id>", methods=['GET'])
def getManagers(staff_id):
    employee = Profile.query.filter_by(staff_id=staff_id).first()
    manager = employee.query.filter_by(staff_id=employee.id).all() #manager name
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

@app.route('/test', methods=['GET'])
def test_route():
    try:
        profiles = Profile.query.all()  # Fetch all profiles from the database
        if not profiles:
            return jsonify({
                "code": 404,
                "message": "No profiles found."
            }), 404
        
        employees = [profile.to_dict() for profile in profiles]  # Convert each profile to a dictionary

        data = {
            "code": 200,
            "data": {
                "employees": employees  # List of employees
            }
        }
        return jsonify(data), 200
    except Exception as e:
        print(f"Error fetching profiles: {str(e)}")  # Print the error message for debugging
        return jsonify({
            "code": 500,
            "message": "An internal server error occurred."  # Error message
        }), 500


if __name__ == '__main__':
    app.run(port=5002, debug=True)                

    