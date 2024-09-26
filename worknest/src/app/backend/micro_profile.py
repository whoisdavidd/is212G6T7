import datetime
from flask import Flask, Request, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS


load_dotenv()


db_url = os.getenv("DATABASE_URL")

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Profile(db.Model):
    __tablename__ = "profile"
    
    staff_id = db.Column(db.Integer, primary_key=True)
    staff_fname = db.Column(db.String(50))
    staff_lname = db.Column(db.String(50))
    dept = db.Column(db.String(50))
    position = db.Column(db.String(50))
    country = db.Column(db.String(50))
    location = db.Column(db.String(50),default = "OFFICE")
    email = db.Column(db.String(50))
    reporting_id = db.Column(db.Integer)
    role = db.Column(db.Integer)
    password = db.Column(db.String(50))
    
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

@app.route("/maangers/<int:staff_id>", methods=['GET'])
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
    
if __name__ == '__main__':
    app.run(port=5002, debug=True)                

    