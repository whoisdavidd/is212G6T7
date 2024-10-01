from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

db_url = os.getenv("DATABASE_URL")

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class WFH(db.Model):
    __tablename__ = 'wfh'
    
    event_id = db.Column(db.Integer, primary_key=True)
    staff_id = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    event_name = db.Column(db.String(50), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    reporting_manager = db.Column(db.String(50))
    reporting_manager_id = db.Column(db.Integer)
    approve_status = db.Column(db.String(50))

    def to_dict(self):
        return {
            'event_id': self.event_id,
            'staff_id': self.staff_id,
            'department': self.department,
            'event_name': self.event_name,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'reporting_manager': self.reporting_manager,
            'reporting_manager_id': self.reporting_manager_id,
            'approve_status': self.approve_status
        }

@app.route('/wfh/<int:event_id>/cancel', methods=['PUT'])
def cancel_wfh_request(event_id):
    wfh_request = WFH.query.get(event_id)
    if not wfh_request:
        return jsonify({'error': 'WFH request not found'}), 404

    if wfh_request.approve_status != 'Pending':
        return jsonify({'error': 'Only pending requests can be cancelled'}), 400

    wfh_request.approve_status = 'Cancelled'
    db.session.commit()

    return jsonify({'message': 'WFH request cancelled successfully', 'wfh': wfh_request.to_dict()}), 200

@app.route('/wfh/<int:event_id>/withdraw', methods=['PUT'])
def withdraw_wfh_request(event_id):
    wfh_request = WFH.query.get(event_id)
    if not wfh_request:
        return jsonify({'error': 'WFH request not found'}), 404

    if wfh_request.approve_status != 'Approved':
        return jsonify({'error': 'Only approved requests can be withdrawn'}), 400

    wfh_request.approve_status = 'Withdrawn'
    db.session.commit()

    return jsonify({'message': 'WFH request withdrawn successfully', 'wfh': wfh_request.to_dict()}), 200

@app.route('/wfh/<int:staff_id>', methods=['GET'])
def get_wfh_requests(staff_id):
    wfh_requests = WFH.query.filter_by(staff_id=staff_id).all()
    return jsonify([wfh.to_dict() for wfh in wfh_requests])

if __name__ == '__main__':
    app.run(port=5002, debug=True)