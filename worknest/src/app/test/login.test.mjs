import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import HomePage from '../page.js'; // Access default export via require

// Mocking fetch globally to simulate an error response
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ message: "An error occurred. Please try again." }),
  })
);

// Mock window.location.href to prevent actual navigation during test
delete window.location;
window.location = { href: '' };

describe('HomePage Functional Test', () => {
  test('displays error message and does not log in', async () => {
    // Use React.createElement to render the component without JSX
    render(createElement(HomePage));

    // Simulate entering email and password
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'Narah.Loo@allinone.com.sg' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: '123' },
    });

    // Simulate clicking the Login button
    fireEvent.click(screen.getByText('Login'));

    // Wait for the error message to appear after the failed login attempt
    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });

    // Assert that the email and password input fields are still in the document
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    // Assert that the URL does not contain any of the protected routes (like /Staff, /Manager, /dashboard)
    expect(window.location.href).not.toContain('/Staff');
    expect(window.location.href).not.toContain('/Manager');
    expect(window.location.href).not.toContain('/dashboard');
  });
});