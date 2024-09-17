from flask import Flask, request, jsonify
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

class Employees(db.Model):
    __tablename__ = "employee"
    
    staff_id = db.Column(db.Integer, primary_key=True)
    staff_fname = db.Column(db.String(100))
    staff_lname = db.Column(db.String(100))
    dept = db.Column(db.String(100))
    position = db.Column(db.String(100))
    country = db.Column(db.String(100))
    email = db.Column(db.String(100))
    reporting_manager = db.Column(db.Integer)
    role = db.Column(db.Integer)

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