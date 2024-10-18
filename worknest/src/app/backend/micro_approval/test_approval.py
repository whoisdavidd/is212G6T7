import unittest
import json
from app import app  # Assuming your Flask app is named `app` in app.py

class ApprovalTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    # Test for approving a request
    def test_approve_request(self):
        # Prepare request data
        data = {
            "request_id": 1,
            "reporting_manager_id": 2003,
            "approver_comment": "Approved for the scheduled work."
        }

        # Send POST request to the approve endpoint
        response = self.app.post(
            '/approve_request',
            data=json.dumps(data),
            content_type='application/json'
        )

        # Assert the response status code
        self.assertEqual(response.status_code, 200)

        # Assert the response data
        response_data = json.loads(response.data)
        self.assertEqual(response_data['status'], 'Request approved')

    # Test for rejecting a request
    def test_reject_request(self):
        # Prepare request data
        data = {
            "request_id": 1,
            "reporting_manager_id": 2003,
            "approver_comment": "Rejected due to schedule conflicts."
        }

        # Send POST request to the reject endpoint
        response = self.app.post(
            '/reject_request',
            data=json.dumps(data),
            content_type='application/json'
        )

        # Assert the response status code
        self.assertEqual(response.status_code, 200)

        # Assert the response data
        response_data = json.loads(response.data)
        self.assertEqual(response_data['status'], 'Request rejected')

if __name__ == '__main__':
    unittest.main()
