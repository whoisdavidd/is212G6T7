import unittest
from unittest.mock import patch
from flask import json
from micro_request import app, Request, db

class RequestServiceTestCase(unittest.TestCase):
    def setUp(self):
        # Set up a test client for the Flask app
        self.app = app.test_client()
        self.app.testing = True

        # Push an application context
        self.app_context = app.app_context()
        self.app_context.push()

    def tearDown(self):
        # Pop the application context after the test
        self.app_context.pop()

    @patch('micro_request.Request.query.get')
    @patch('micro_request.requests.post')
    def test_withdraw_request(self, mock_post, mock_get):
        # Mock the request object
        mock_request = Request(
            request_id=1, staff_id=1, department="IT", start_date="2024-01-01",
            reason="WFH", duration="1 day", status="pending", reporting_manager_id=2,
            reporting_manager_name="John Doe", day_id=1, recurring_days=0
        )
        mock_get.return_value = mock_request

        # Simulate a request context and session data (logged-in user)
        with app.test_request_context():  # Using `app`, not `self.app`
            with self.app.session_transaction() as sess:
                sess['staff_id'] = 1
                sess['role'] = 2  # Role 2 for staff

            # Send PUT request to withdraw the request
            response = self.app.put('/request/withdraw/1')

            # Check status code
            self.assertEqual(response.status_code, 200)

            # Check if the request status was updated to "Withdrawn"
            mock_request.status = 'Withdrawn'
            mock_post.return_value.status_code = 200  # Mock the response from Schedule service
            self.assertEqual(mock_request.status, 'Withdrawn')

    @patch('micro_request.db.session.add')
    @patch('micro_request.db.session.commit')
    def test_add_request(self, mock_commit, mock_add):
        # Prepare request data
        request_data = {
            'department': 'HR',
            'start_date': '2024-01-02',
            'reason': 'WFH',
            'duration': '2 days',
            'status': 'pending',
            'reporting_manager_id': 3,
            'reporting_manager_name': 'Jane Doe',
            'day_id': 1,
            'recurring_days': 0
        }

        # Simulate a request context
        with app.test_request_context():  # Using `app`, not `self.app`
            # Send POST request to add a new request
            response = self.app.post('/add_request/1', json=request_data)

            # Check status code
            self.assertEqual(response.status_code, 200)

            # Load the response data
            data = json.loads(response.data)

            # Check if the new request has been created with the correct data
            self.assertEqual(data['staff_id'], 1)
            self.assertEqual(data['department'], 'HR')

if __name__ == '__main__':
    unittest.main()