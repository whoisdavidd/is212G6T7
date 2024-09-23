from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
load_dotenv()

app = Flask(__name__)

db_url = os.getenv("DATABASE_URL")

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Javanchok13@localhost:5432/employee'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class WFH(db.Model):
    __tablename__ = 'wfh'
    
    # Columns based on your SQL table structure
    staff_id = db.Column(db.Integer, db.ForeignKey('employee.staff_id'), nullable=False)  # FK to employee table
    department = db.Column(db.String(50), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.event_id', ondelete='CASCADE'), primary_key=True)  # FK to event table
    event_name = db.Column(db.String(50), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    reporting_manager = db.Column(db.String(50))
    reporting_manager_id = db.Column(db.Integer)
    approve_status = db.Column(db.String(50))  # Approval status

    # Initialize the attributes
    def __init__(self, staff_id, department, event_id, event_name, event_date, reporting_manager, reporting_manager_id, approve_status):
        self.staff_id = staff_id
        self.department = department
        self.event_id = event_id
        self.event_name = event_name
        self.event_date = event_date
        self.reporting_manager = reporting_manager
        self.reporting_manager_id = reporting_manager_id
        self.approve_status = approve_status

    # Convert the model to a dictionary
    def to_dict(self):
        return {
            'staff_id': self.staff_id,
            'department': self.department,
            'event_id': self.event_id,
            'event_name': self.event_name,
            'event_date': str(self.event_date),  # Convert date to string for JSON response
            'reporting_manager': self.reporting_manager,
            'reporting_manager_id': self.reporting_manager_id,
            'approve_status': self.approve_status
        }

@app.route('/events/<int:staff_id>', methods=['GET'])
def get_events_by_staff(staff_id):
    # Query WFH events by staff ID
    wfh_requests = WFH.query.filter_by(staff_id=staff_id).all()

    if not wfh_requests:
        return jsonify({'error': 'No events found for this staff member'}), 404

    # Convert the events to a list of dictionaries
    events = [wfh.to_dict() for wfh in wfh_requests]

    # Return JSON response with event details
    return jsonify(events), 200

if __name__ == '__main__':
    app.run(debug=True)
