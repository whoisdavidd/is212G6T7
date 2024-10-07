import unittest
from flask import json
from unittest.mock import patch
from micro_profile import app, Profile

class FlaskAppTestCase(unittest.TestCase):
    def setUp(self):
        # Create a test client for the Flask app
        self.app = app.test_client()
        self.app.testing = True

        # Push an application context
        self.app_context = app.app_context()
        self.app_context.push()

    def tearDown(self):
        # Pop the application context
        self.app_context.pop()

    @patch('micro_profile.Profile.query')
    def test_get_all_profiles(self, mock_query):
        # Mock the Profile data
        mock_profile = Profile(
            staff_id=1, staff_fname="John", staff_lname="Doe",
            department="HR", position="Manager", country="USA", 
            location="OFFICE", email="john.doe@example.com", 
            reporting_manager_id=2, role=1, password="password123"
        )
        mock_query.all.return_value = [mock_profile]  # Return a list with one mock profile

        # Send GET request to the route
        response = self.app.get('/profile')

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Load the response data
        data = json.loads(response.data)

        # Check the returned profile data
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['staff_fname'], 'John')
        self.assertEqual(data[0]['department'], 'HR')

    @patch('micro_profile.Profile.query')
    def test_get_piechart_data(self, mock_query):
        # Mock two profiles with different locations
        mock_profile_1 = Profile(staff_id=1, staff_fname="John", staff_lname="Doe", location="OFFICE")
        mock_profile_2 = Profile(staff_id=2, staff_fname="Jane", staff_lname="Smith", location="WFH")
        mock_query.all.return_value = [mock_profile_1, mock_profile_2]  # Two profiles

        # Send GET request to the piechart route
        response = self.app.get('/piechart')

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Load response data
        data = json.loads(response.data)

        # Check the pie chart data
        self.assertEqual(data[0]['label'], 'Office')
        self.assertEqual(data[0]['value'], 1)
        self.assertEqual(data[1]['label'], 'WFH')
        self.assertEqual(data[1]['value'], 1)

    @patch('micro_profile.Profile.query')
    def test_authentication(self, mock_query):
        # Mock the Profile data
        mock_profile = Profile(
            staff_id=1, staff_fname="John", staff_lname="Doe", 
            department="HR", position="Manager", country="USA",
            location="OFFICE", email="john.doe@example.com", 
            reporting_manager_id=2, role=1, password="password123"
        )
        mock_query.filter_by.return_value.first.return_value = mock_profile

        # Prepare login data
        login_data = {
            "email": "john.doe@example.com",
            "password": "password123"
        }

        # Send POST request to the login route
        response = self.app.post('/login', json=login_data)

        # Check status code
        self.assertEqual(response.status_code, 200)

        # Load response data
        data = json.loads(response.data)

        # Check the returned profile data
        self.assertEqual(data['data']['employee']['staff_fname'], 'John')
        self.assertEqual(data['data']['department'], 'HR')

if __name__ == '__main__':
    unittest.main()