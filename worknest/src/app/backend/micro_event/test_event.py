import unittest
from flask import json
from unittest.mock import patch
from micro_event import app, event  # Adjust your import for 'app'

class EventTestCase(unittest.TestCase):
    def setUp(self):
        # Set up a test client for the Flask app
        self.app = app.test_client()
        self.app.testing = True

        # Push an application context
        self.app_context = app.app_context()
        self.app_context.push()

    def tearDown(self):
        # Remove the application context after the test
        self.app_context.pop()

    @patch('micro_event.event.query')
    def test_get_all_events(self, mock_query):
        # Mock the data to return a list of events
        mock_event = event(department="IT", event_name="Public Holiday", event_date="2024-01-01")
        mock_event.id = 1  # Manually setting the ID for the test
        mock_query.all.return_value = [mock_event]

        # Send a GET request to the route using the test client
        response = self.app.get('/event/public-holiday')

        # Check if the status code is 200
        self.assertEqual(response.status_code, 200)

        # Load the response data
        data = json.loads(response.data)

        # Check if the returned data matches the expected result
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['department'], 'IT')
        self.assertEqual(data[0]['event_name'], 'Public Holiday')
        self.assertEqual(data[0]['event_date'], '01-01-2024')  # Checking DD-MM-YYYY format

if __name__ == '__main__':
    unittest.main()