import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "../../app/page.js";
// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ message: "An error occurred. Please try again." }),
  })
);

describe("HomePage Functional Test", () => {
  test("displays error message and does not log in", async () => {
    // Render the HomePage component
    render(<HomePage />);

    // Simulate user entering email and password
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "Narah.Loo@allinone.com.sg" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "123" },
    });

    // Simulate the login form submission
    fireEvent.click(screen.getByText("Login"));

    // Wait for the async fetch call to resolve and check for error message
    await waitFor(() => {
      expect(
        screen.getByText("An error occurred. Please try again.")
      ).toBeInTheDocument();
    });

    // Verify that the staff is not redirected and stays on the login page
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    
    // Staff should not be able to see the schedule (no redirect)
    expect(window.location.href).not.toContain("/Staff");
    expect(window.location.href).not.toContain("/Manager");
    expect(window.location.href).not.toContain("/dashboard");
  });
});