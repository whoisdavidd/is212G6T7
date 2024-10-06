from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
import os
from flask_cors import CORS


load_dotenv()

app = Flask(__name__)

db_url = os.getenv("SQLALCHEMY_DATABASE_URI")

CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db =SQLAlchemy(app)

class event(db.Model):
    __tablename__ = 'event'

    id = db.Column(db.Integer, primary_key=True)  # Adding a primary key
    department = db.Column(db.String(50), nullable=False)
    event_name = db.Column(db.String(50), nullable=False)
    event_date = db.Column(db.String(50), nullable=False)

    def __init__(self, department, event_name, event_date):
        self.department = department
        self.event_name = event_name
        self.event_date = event_date
    def to_dict(self):
        return {
            'id': self.id,
            'department': self.department,
            'event_name': self.event_name,
            'event_date': self.event_date
        }

#Route to get all events
@app.route('/event/public-holiday', methods=['GET'])
def get_all_events():
    events = event.query.all()
    return jsonify([event.to_dict() for event in events])

if __name__ == '__main__':
    app.run(port=5001, debug=True)