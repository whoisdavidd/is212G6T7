from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
import os
from flask_cors import CORS
from src.app.backend.db import db

load_dotenv()

app = Flask(__name__)

db_url = os.getenv("DATABASE_URL")

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db = SQLAlchemy(app)
db.init_app(app)
class Department(db.Model):
    __tablename__ = 'department'
    
    staff_id = db.Column(db.Integer, primary_key=True)  # Inherited from employee
    department = db.Column(db.String(50), nullable=False, unique=True)
    location = db.Column(db.String(50), nullable=False)
    wfh_quota = db.Column(db.Integer, nullable=False,default = 20)  # Work From Home quota in days
    
    #relationship to event table
    # events = db.relationship('Event', backref='department_info', cascade="all, delete", lazy=True)   

    def __init__(self, staff_id, department,location, wfh_quota):
        self.staff_id = staff_id
        self.department = department
        self.location = location
        self.wfh_quota = wfh_quota

    def to_dict(self):
        return {
            'staff_id': self.staff_id,
            'department': self.department,
            'location'  : self.location,
            'wfh_quota': self.wfh_quota
        }

# Route to add a new department
@app.route('/department', methods=['POST'])
def add_department():
    data = request.get_json()
    if not data or 'staff_id' not in data or 'department' not in data or 'wfh_quota' not in data:
        return jsonify({'error': 'Missing staff ID, department name, or WFH quota'}), 400

    if Department.query.filter_by(staff_id=data['staff_id']).first():
        return jsonify({'error': 'Department for this staff member already exists'}), 409

    new_department = Department(staff_id=data['staff_id'], department=data['department'], location=data['location'], wfh_quota=data['wfh_quota'])
    db.session.add(new_department)
    db.session.commit()

    return jsonify({'message': 'Department added successfully', 'department': new_department.to_dict()}), 201


# Route to get all departments
@app.route('/departments', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    return jsonify([dept.to_dict() for dept in departments]), 200

#Route for PieChart
@app.route('/piechart', methods=['GET'])
def pie_chart():
    wfh_count = Department.query.filter_by(location='WFH').count()
    office_count = Department.query.filter_by(location='OFFICE').count()
    data = [
        {"label": "WFH", "value": wfh_count},
        {"label": "OFFICE", "value": office_count}
    ]
    return jsonify(data), 200
# Route to update a department
@app.route('/department/<int:dept_id>', methods=['PATCH'])
def update_department(dept_id):
    department = Department.query.get(dept_id)
    if not department:
        return jsonify({'error': 'Department not found'}), 404

    data = request.get_json()
    if 'wfh_quota' in data:
        department.wfh_quota = data['wfh_quota']
        db.session.commit()
        return jsonify({'message': 'WFH quota updated successfully', 'department': department.to_dict()}), 200

    return jsonify({'error': 'No updates provided'}), 400

# Route to delete a department
@app.route('/department/<int:dept_id>', methods=['DELETE'])
def delete_department(dept_id):
    department = Department.query.get(dept_id)
    if not department:
        return jsonify({'error': 'Department not found'}), 404

    db.session.delete(department)
    db.session.commit()

    return jsonify({'message': 'Department deleted successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
