// login.test.mjs
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const HomePage = require('worknest/src/app/page.js'); // Use require instead of import

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ message: "An error occurred. Please try again." }),
  })
);

describe('HomePage Functional Test', () => {
  test('displays error message and does not log in', async () => {
    render(<HomePage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'Narah.Loo@allinone.com.sg' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    expect(window.location.href).not.toContain('/Staff');
    expect(window.location.href).not.toContain('/Manager');
    expect(window.location.href).not.toContain('/dashboard');
  });
});