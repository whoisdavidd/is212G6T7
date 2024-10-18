import unittest
from unittest.mock import patch, MagicMock
from flask import json
from micro_request import app, RequestModel, db
from datetime import datetime, timedelta

class RequestServiceTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.app_context = app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()

    @patch('micro_request.RequestModel.query')
    def test_get_staff_requests(self, mock_query):
        # Mock data for staff requests
        mock_requests = [
            RequestModel(staff_id=1, department="IT", start_date="2024-01-01",
                reason="WFH", duration=1, status="Approved", reporting_manager_id=2,
                reporting_manager_name="John Doe", reporting_manager_email="john@example.com",
                requester_email="staff@example.com", day_id=1, recurring_days=1),
            RequestModel(staff_id=1, department="IT", start_date="2024-01-08",
                reason="WFH", duration=2, status="Pending", reporting_manager_id=2,
                reporting_manager_name="John Doe", reporting_manager_email="john@example.com",
                requester_email="staff@example.com", day_id=2, recurring_days=2)
        ]
        mock_requests[0].request_id = 1
        mock_requests[1].request_id = 2
        mock_query.filter_by.return_value.all.return_value = mock_requests

        response = self.app.get('/request/staff/1')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['request_id'], 1)
        self.assertEqual(data[0]['recurring_days'], 1)
        self.assertEqual(data[1]['request_id'], 2)
        self.assertEqual(data[1]['recurring_days'], 2)

    @patch('micro_request.RequestModel.query')
    def test_update_request(self, mock_query):
        mock_request = MagicMock()
        mock_request.status = 'Pending'
        mock_request.staff_id = 1
        mock_request.department = 'IT'
        mock_request.to_dict.return_value = {
            'request_id': 1,
            'staff_id': 1,
            'department': 'IT',
            'start_date': '2024-02-01',
            'duration': 3,
            'reason': 'WFH - Updated',
            'status': 'Pending'
        }
        mock_query.get.return_value = mock_request

        update_data = {
            'start_date': '2024-02-01',
            'duration': 3,
            'reason': 'WFH - Updated',
            'status': 'Pending'
        }

        response = self.app.put('/request/update/1', 
                                data=json.dumps(update_data),
                                content_type='application/json',
                                headers={'X-Role': '2', 'X-Staff-ID': '1', 'X-Department': 'IT'})

        print(f"Response status code: {response.status_code}")
        print(f"Response data: {response.data.decode('utf-8')}")

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Request updated successfully.')
        
        # Update these assertions
        self.assertEqual(mock_request.start_date.isoformat(), '2024-02-01')
        self.assertEqual(mock_request.duration, 3)
        self.assertEqual(mock_request.reason, 'WFH - Updated')

    @patch('micro_request.RequestModel.query')
    def test_update_approved_request(self, mock_query):
        mock_request = MagicMock()
        mock_request.status = 'Approved'
        mock_request.staff_id = 1
        mock_request.department = 'IT'
        mock_request.to_dict.return_value = {
            'request_id': 1,
            'staff_id': 1,
            'department': 'IT',
            'start_date': '2024-02-01',
            'duration': 3,
            'reason': 'WFH - Updated',
            'status': 'Pending'
        }
        mock_query.get.return_value = mock_request

        update_data = {
            'start_date': '2024-02-01',
            'duration': 3,
            'reason': 'WFH - Updated',
            'status': 'Pending'
        }

        response = self.app.put('/request/update/1', 
                                data=json.dumps(update_data),
                                content_type='application/json',
                                headers={'X-Role': '2', 'X-Staff-ID': '1', 'X-Department': 'IT'})

        print(f"Response status code: {response.status_code}")
        print(f"Response data: {response.data.decode('utf-8')}")

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['message'], 'Request updated successfully.')
        self.assertEqual(mock_request.status, 'Pending')  # Status should change to Pending

    @patch('micro_request.RequestModel.query')
    def test_get_request_details(self, mock_query):
        mock_request = RequestModel(staff_id=1, department="IT", start_date="2024-01-01",
                               reason="WFH", duration=1, status="Approved", reporting_manager_id=2,
                               reporting_manager_name="John Doe", reporting_manager_email="john@example.com",
                               requester_email="staff@example.com", day_id=1, recurring_days=1)
        mock_request.request_id = 1  # Set the request_id after initialization
        mock_query.get.return_value = mock_request

        response = self.app.get('/request/1')
        self.assertEqual(response.status_code, 200)
        
        data = json.loads(response.data)
        self.assertEqual(data['request_id'], 1)
        self.assertEqual(data['staff_id'], 1)
        self.assertEqual(data['start_date'], "2024-01-01")
        self.assertEqual(data['reason'], "WFH")
        self.assertEqual(data['recurring_days'], 1)

if __name__ == '__main__':
    unittest.main()
