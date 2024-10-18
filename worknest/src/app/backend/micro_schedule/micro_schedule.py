import datetime
from flask import Flask, Request, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS
from datetime import datetime, date

load_dotenv()


db_url = os.getenv("SQLALCHEMY_DATABASE_URI")

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db =SQLAlchemy(app)


class Schedule(db.Model):
    __tablename__ = "schedule"
    
    staff_id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    
    def __init__(self, staff_id, date, department, status):
        self.staff_id = staff_id
        self.date = datetime.strptime(date, "%Y-%m-%d").date() if isinstance(date, str) else date
        self.department = department
        self.status = status

    def to_dict(self):
        return {
            'staff_id': self.staff_id,
            'date': self.date.strftime("%Y-%m-%d") if self.date else None,
            'department': self.department,
            'status': self.status
        }
    



# ---------------------------------- Update Schedule ----------------------------------

@app.route('/schedule/update', methods=['POST'])
def update_schedule():
    try:
        data = request.get_json()
        staff_id = data['staff_id']
        date = datetime.strptime(data['date'], "%Y-%m-%d").date()
        department = data['department']
        status = data['status']

        schedule_entry = Schedule.query.filter_by(staff_id=staff_id).first()

        if schedule_entry:
            schedule_entry.date = date
            schedule_entry.department = department
            schedule_entry.status = status
            db.session.commit()
            return jsonify({"message": "Schedule updated successfully"}), 200
        else:
            new_schedule = Schedule(staff_id=staff_id, date=date, department=department, status=status)
            db.session.add(new_schedule)
            db.session.commit()
            return jsonify({"message": "New schedule entry created successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# ---------------------------------- Get All Schedules ----------------------------------

@app.route('/schedule', methods=['GET'])
def get_all_schedules():
    schedules = Schedule.query.all()
    return jsonify([schedule.to_dict() for schedule in schedules])
@app.route('/schedule/<int:staff_id>', methods=['GET'])
def get_schedule(staff_id):
    schedule = Schedule.query.filter_by(staff_id=staff_id).first()
    if schedule:
        return jsonify(schedule.to_dict())
    return jsonify({"staff_id": None, "date": None, "department": None, "status": None})
    



# ---------------------------------- Main ----------------------------------

if __name__ == '__main__':
    app.run(port=5004, debug=True)
