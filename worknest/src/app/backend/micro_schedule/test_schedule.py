import unittest
from flask import json
from micro_schedule import app, Schedule, db

class ScheduleServiceTestCase(unittest.TestCase):
    def setUp(self):
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['TESTING'] = True
        self.app = app.test_client()
        with app.app_context():
            db.create_all()

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def test_get_all_schedules(self):
        with app.app_context():
            # Create some test data
            schedule1 = Schedule(staff_id=1, date="2024-01-01", department="HR", status="present")
            schedule2 = Schedule(staff_id=2, date="2024-01-02", department="IT", status="WFH")
            db.session.add(schedule1)
            db.session.add(schedule2)
            db.session.commit()

        # Send GET request to the /schedule route
        response = self.app.get('/schedule')

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Load the response data
        data = json.loads(response.data)

        # Check the returned schedule data
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['department'], 'HR')
        self.assertEqual(data[0]['status'], 'present')
        self.assertEqual(data[1]['department'], 'IT')
        self.assertEqual(data[1]['status'], 'WFH')

    def test_get_schedule(self):
        with app.app_context():
            # Create a test schedule
            schedule = Schedule(staff_id=1, date="2024-01-01", department="HR", status="present")
            db.session.add(schedule)
            db.session.commit()

        # Send GET request to the /schedule/1 route
        response = self.app.get('/schedule/1')

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Load the response data
        data = json.loads(response.data)

        # Check the returned schedule data
        self.assertEqual(data['staff_id'], 1)
        self.assertEqual(data['date'], "2024-01-01")
        self.assertEqual(data['department'], "HR")
        self.assertEqual(data['status'], "present")

    def test_update_existing_schedule(self):
        with app.app_context():
            # Create an existing schedule
            schedule = Schedule(staff_id=1, date="2024-01-01", department="HR", status="present")
            db.session.add(schedule)
            db.session.commit()

        # Prepare update data
        update_data = {
            "staff_id": 1,
            "date": "2024-01-02",
            "department": "IT",
            "status": "WFH"
        }

        # Send POST request to update the schedule
        response = self.app.post('/schedule/update', json=update_data)

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Check the response message
        data = json.loads(response.data)
        self.assertEqual(data['message'], "Schedule updated successfully")

        # Verify the update in the database
        with app.app_context():
            updated_schedule = Schedule.query.filter_by(staff_id=1).first()
            self.assertEqual(updated_schedule.date.strftime("%Y-%m-%d"), "2024-01-02")
            self.assertEqual(updated_schedule.department, "IT")
            self.assertEqual(updated_schedule.status, "WFH")

    def test_create_new_schedule(self):
        # Prepare new schedule data
        new_schedule_data = {
            "staff_id": 2,
            "date": "2024-01-02",
            "department": "HR",
            "status": "present"
        }

        # Send POST request to create a new schedule
        response = self.app.post('/schedule/update', json=new_schedule_data)

        # Check status code
        self.assertEqual(response.status_code, 201)

        # Check the response message
        data = json.loads(response.data)
        self.assertEqual(data['message'], "New schedule entry created successfully")

        # Verify the new schedule in the database
        with app.app_context():
            new_schedule = Schedule.query.filter_by(staff_id=2).first()
            self.assertIsNotNone(new_schedule)
            self.assertEqual(new_schedule.date.strftime("%Y-%m-%d"), "2024-01-02")
            self.assertEqual(new_schedule.department, "HR")
            self.assertEqual(new_schedule.status, "present")

    def test_get_schedule_not_found(self):
        # Send GET request to the /schedule/<staff_id> route for a non-existent staff_id
        response = self.app.get('/schedule/999')

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Load the response data
        data = json.loads(response.data)

        # Check the returned default response
        self.assertEqual(data, {"staff_id": None, "date": None, "department": None, "status": None})

if __name__ == '__main__':
    unittest.main()
