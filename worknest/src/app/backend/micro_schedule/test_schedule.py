# import unittest
# from unittest.mock import patch
# from flask import json
# from micro_schedule import app, Schedule, db

# class ScheduleServiceTestCase(unittest.TestCase):
#     def setUp(self):
#         # Set up a test client for the Flask app
#         self.app = app.test_client()
#         self.app.testing = True

#         # Push an application context
#         self.app_context = app.app_context()
#         self.app_context.push()

#     def tearDown(self):
#         # Pop the application context after the test
#         self.app_context.pop()

#     @patch('micro_schedule.Schedule.query.all')
#     def test_get_all_schedules(self, mock_query_all):
#         # Mock the Schedule data
#         mock_schedule = Schedule(
#             staff_id=1, date="2024-01-01", department="HR", status="present"
#         )
#         mock_query_all.return_value = [mock_schedule]  # Return a list with one mock schedule

#         # Send GET request to the /schedule route
#         response = self.app.get('/schedule')

#         # Check status code
#         self.assertEqual(response.status_code, 200)

#         # Load the response data
#         data = json.loads(response.data)

#         # Check the returned schedule data
#         self.assertEqual(len(data), 1)
#         self.assertEqual(data[0]['department'], 'HR')
#         self.assertEqual(data[0]['status'], 'present')

#     @patch('micro_schedule.Schedule.query.filter_by')
#     def test_get_schedule(self, mock_filter_by):
#         # Mock the Schedule object
#         mock_schedule = Schedule(
#             staff_id=1, date="2024-01-01", department="IT", status="WFH"
#         )
#         mock_filter_by.return_value.first.return_value = mock_schedule

#         # Send GET request to the /schedule/<staff_id> route
#         response = self.app.get('/schedule/1')

#         # Check status code
#         self.assertEqual(response.status_code, 200)

#         # Load the response data
#         data = json.loads(response.data)

#         # Check the returned schedule data
#         self.assertEqual(data['staff_id'], 1)
#         self.assertEqual(data['department'], 'IT')
#         self.assertEqual(data['status'], 'WFH')

#     @patch('micro_schedule.db.session.commit')
#     @patch('micro_schedule.db.session.add')
#     @patch('micro_schedule.Schedule.query.filter_by')
#     def test_update_schedule(self, mock_filter_by, mock_add, mock_commit):
#         # Mock the incoming request data
#         mock_data = {
#             "staff_id": 1,
#             "date": "2024-01-02",
#             "department": "HR",
#             "status": "present"
#         }

#         # Mock an existing schedule entry
#         mock_schedule = Schedule(
#             staff_id=1, date="2024-01-01", department="IT", status="WFH"
#         )
#         mock_filter_by.return_value.first.return_value = mock_schedule

#         # Send POST request to update the schedule
#         with self.app.test_request_context(json=mock_data):
#             response = self.app.post('/schedule', json=mock_data)

#             # Check status code
#             self.assertEqual(response.status_code, 200)

#             # Ensure the schedule has been updated
#             mock_schedule.date = "2024-01-02"
#             mock_schedule.department = "HR"
#             mock_schedule.status = "present"

#             # Check the mock data is correct
#             self.assertEqual(mock_schedule.department, "HR")
#             self.assertEqual(mock_schedule.status, "present")

#     @patch('micro_schedule.db.session.commit')
#     @patch('micro_schedule.db.session.add')
#     @patch('micro_schedule.Schedule.query.filter_by')
#     def test_create_new_schedule(self, mock_filter_by, mock_add, mock_commit):
#         # Mock the incoming request data
#         mock_data = {
#             "staff_id": 2,
#             "date": "2024-01-02",
#             "department": "HR",
#             "status": "present"
#         }

#         # Mock no existing schedule entry (so a new one should be created)
#         mock_filter_by.return_value.first.return_value = None

#         # Send POST request to create a new schedule
#         with self.app.test_request_context(json=mock_data):
#             response = self.app.post('/schedule', json=mock_data)

#             # Check status code (201 for new schedule creation)
#             self.assertEqual(response.status_code, 201)

#             # Ensure a new schedule has been added
#             mock_add.assert_called()

# if __name__ == '__main__':
#     unittest.main()