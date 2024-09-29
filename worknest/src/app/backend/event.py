from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
from employee import Employees
from wfh import WFH
from department import Department

load_dotenv()

app = Flask(__name__)

db_url = os.getenv("DATABASE_URL")

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Liverpool13@localhost:5432/employee'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Event(db.Model):
    tablename = 'event'
    
    event_id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, db.ForeignKey('employee.staff_id'), nullable=False)
    event_name = db.Column(db.String(50), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    reporting_manager = db.Column(db.String(50))
    reporting_manager_id = db.Column(db.Integer)
    department = db.Column(db.String(50),db.ForeignKey('department.department'), nullable=False)  # ForeignKey to Department
    event_type = db.Column(db.String(50))
    # Add relationship to WFH table
    # wfh_records = db.relationship('WFH', backref='event', cascade="all, delete", lazy=True) #this one dont need 

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
@app.route('/add_event', methods=['POST'])
def add_event():
    data = request.get_json()

    # Check if all required fields are present
    if not data or 'staff_id' not in data or 'event_name' not in data or 'event_date' not in data:
        return jsonify({'error': 'Missing event details'}), 400

    # Fetch the employee using Employees.query
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
        reporting_manager=f"{employee.staff_fname} {employee.staff_lname}",
        reporting_manager_id=employee.reporting_manager,
        department=employee.dept,
        event_type=data.get('event_type', 'General')  # Optional field
    )
    
    db.session.add(new_event)

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

    # Update the existing department instead of creating a new one
    db.session.commit()  # Commit once after adding both

    return jsonify({'message': 'Event added successfully', 'event': new_event.to_dict()}), 201


    
# Route to get all events
@app.route('/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([event.to_dict() for event in events]), 200

# Route to get events by staff ID
@app.route('/events/<int:staff_id>', methods=['GET'])
def get_events_by_staff_id(staff_id):
    # Fetch events for the given staff ID
    events = Event.query.filter_by(staff_id=staff_id).all()
    
    # If no events found, return a 404 error
    if not events:
        return jsonify({'message': 'No events found for this staff ID'}), 404

    # Return the events as a JSON response
    return jsonify([event.to_dict() for event in events]), 200

if __name__ == '__main__':
    app.run(port=5001, debug=True)