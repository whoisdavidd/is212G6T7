from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
from worknest.src.app.backend.employee.employee import Employees
from worknest.src.app.backend.wfh.wfh import WFH
from worknest.src.app.backend.department.department import Department

load_dotenv()

app = Flask(__name__)

db_url = os.getenv("DATABASE_URL")

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Event(db.Model):
    __tablename__ = 'event'
    
    event_id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('employee.staff_id'), nullable=False)
    event_name = db.Column(db.String(50), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    reporting_manager = db.Column(db.String(50))
    reporting_manager_id = db.Column(db.Integer)
    department = db.Column(db.String(50),db.ForeignKey('department.department'), nullable=False)  # ForeignKey to Department
    event_type = db.Column(db.String(50))
    # Add relationship to WFH table
    wfh_records = db.relationship('WFH', backref='event', cascade="all, delete", lazy=True)

    def __init__(self, staff_id, event_name, event_date, reporting_manager, reporting_manager_id, department, event_type):
        self.staff_id = staff_id
        self.event_name = event_name
        self.event_date = event_date
        self.reporting_manager = reporting_manager
        self.reporting_manager_id = reporting_manager_id
        self.department = department
        self.event_type = event_type

    def to_dict(self):
        return {
            'event_id': self.event_id,
            'staff_id': self.staff_id,
            'event_name': self.event_name,
            'event_date': str(self.event_date),
            'reporting_manager': self.reporting_manager,
            'reporting_manager_id': self.reporting_manager_id,
            'department': self.department,
            'event_type': self.event_type
        }

# Route to add an event
@app.route('/event', methods=['POST'])
def add_event():
    
    data = request.get_json()

    # Check if all required fields are present
    if not data or 'staff_id' not in data or 'event_name' not in data or 'event_date' not in data:
        return jsonify({'error': 'Missing event details'}), 400

    # Fetch the employee using Employees.query, no need to reassign Employees
    employee = Employees.query.filter_by(staff_id=data['staff_id']).first()
    
    if not employee:
        return jsonify({'error': 'Employee not found'}), 404
    
    # Fetch the department
    department = Department.query.filter_by(department=employee.dept).first()
    
    if not department:
        return jsonify({'error': 'Department not found'}), 404

    # Reduce the WFH quota if the event type is 'WFH'
    if data.get('event_type') == 'WFH':
        if department.wfh_quota > 0:
            department.wfh_quota -= 1  # Reduce the quota by 1 day
        else:
            return jsonify({'error': 'No WFH quota left for this department'}), 400

    # Create a new event
    new_event = Event(
        staff_id=data['staff_id'],
        event_name=data['event_name'],
        event_date=data['event_date'],
        reporting_manager=employee.staff_fname + ' ' + employee.staff_lname,
        reporting_manager_id=employee.reporting_manager,
        department=employee.dept,
        event_type=data.get('event_type', 'General')  # Optional field
    )
    
    db.session.add(new_event)
    db.session.commit()
    
    new_wfh = WFH(
        staff_id=data['staff_id'],
        department=new_event.department,
        event_id=new_event.event_id,
        event_name=data['event_name'],
        event_date=data['event_date'],
        reporting_manager=new_event.reporting_manager,
        reporting_manager_id=new_event.reporting_manager_id,
        approve_status='Pending'  # Default status
    )
    db.session.add(new_wfh)
    db.session.commit()
    
    new_dept = Department(
        staff_id=data['staff_id'],
        department=new_event.department,
        wfh_quota=department.wfh_quota
    )
    db.session.add(new_dept)
    db.session.commit()


    return jsonify({'message': 'Event added successfully', 'event': new_event.to_dict()}), 201

# Route to display the form to add an event
@app.route('/add_event', methods=['GET'])
def display_event_form():
    # Query the Employees table and pass the data to the template
    employees = Employees.query.all()
     # Convert employees data to a JSON serializable format
    employee_data = [{'id': e.id, 'name': e.name} for e in employees]

    # Return the employee data as JSON
    return jsonify(employee_data)
# Route to get all events
@app.route('/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([event.to_dict() for event in events]), 200

if __name__ == '__main__':
    app.run(debug=True)
