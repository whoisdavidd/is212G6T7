from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS


load_dotenv()


db_url = os.getenv("DATABASE_URL")

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Javanchok13@localhost:5432/employee'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Employees(db.Model):
    __tablename__ = "employee"
    
    staff_id = db.Column(db.Integer, primary_key=True)
    staff_fname = db.Column(db.String(50))
    staff_lname = db.Column(db.String(50))
    dept = db.Column(db.String(50))
    position = db.Column(db.String(50))
    country = db.Column(db.String(50))
    email = db.Column(db.String(50))
    reporting_manager = db.Column(db.Integer, db.ForeignKey('employee.staff_id'))
    role = db.Column(db.Integer, db.ForeignKey('role.role_id'))
    
    # # Define relationships
    manager = db.relationship('Employees', remote_side=[staff_id], backref='employees')
    

    def to_dict(self):
        return {
            'staff_id': self.staff_id,
            'staff_fname': self.staff_fname,
            'staff_lname': self.staff_lname,
            'dept': self.dept,
            'position': self.position,
            'country': self.country,
            'email': self.email,
            'reporting_manager': self.reporting_manager,
            'role': self.role
        }
    def __init__(self , staff_id, staff_fname, staff_lname, dept, position, country, email, reporting_manager, role):
        self.staff_id = staff_id
        self.staff_fname = staff_fname
        self.staff_lname = staff_lname
        self.dept = dept
        self.position = position
        self.country = country
        self.email = email
        self.reporting_manager = reporting_manager
        self.role = role

    #getters
    def getStaffId(self):
        return self.staff_id
    def getFname(self):
        return self.staff_fname
    def getLname(self):
        return self.staff_lname
    def getDept(self):
        return self.dept
    def getPosition(self):
        return self.position
    def getCountry(self):
        return self.country
    def getEmail(self):
        return self.email
    def getReportingManager(self):
        return self.reporting_manager
    def getRole(self):
        return self.role

@app.route("/employee")
def get_all():
    employees_list = db.session.scalars(db.select(Employees)).all()
    
    if employees_list:
        return jsonify(
            {
                "code": 200,
                "data": {
                    "employees": [employee.to_dict() for employee in employees_list]
                }
            }
        )
    return jsonify(
        {
            "code": 404,
            "message": "There are no employees."
        }
    ), 404



if __name__ == "__main__":
    app.run(debug=True)