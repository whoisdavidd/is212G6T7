from flask import Flask, request, jsonify,render_template
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
from worknest.src.app.backend.db import db  # Import the shared db instance
load_dotenv()

app = Flask(__name__)

db_url = os.getenv("DATABASE_URL")

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

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
    def __init__(self, staff_id, department,event_id, event_name, event_date, reporting_manager, reporting_manager_id, approve_status):
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
@app.route('/wfhStatus', methods=['POST'])
def update_wfh_status():
    data = request.get_json()

    # Validate the request data
    if not data or 'staff_id' not in data or 'approve_status' not in data:
        return jsonify({'error': 'Missing required fields'}), 400

    # Get the staff ID and the new approval status
    staff_id = data['staff_id']
    new_status = data['approve_status']

    # Find the WFH request for the given staff_id
    wfh_request = WFH.query.filter_by(staff_id=staff_id).first()

    if not wfh_request:
        return jsonify({'error': 'WFH request not found'}), 404

    # Update the approval status
    wfh_request.approve_status = new_status
    db.session.commit()

    return jsonify({'message': 'WFH request updated successfully', 'wfh': wfh_request.to_dict()}), 200

@app.route('/wfh_status', methods=['GET'])
def display_wfh_status():
    # Query all WFH requests
    wfh_requests = WFH.query.all()
    
    # Pass the wfh_requests list to the HTML template
    return render_template('wfhStatus.html', wfh_requests=wfh_requests)

if __name__ == '__main__':
    app.run(debug=True)