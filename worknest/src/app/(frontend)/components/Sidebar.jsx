import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import FontAwesome for icons

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <i className="fas fa-th-large"></i> Dashboard
        </li>
        <li>
          <i className="fas fa-dumbbell"></i> Workout
        </li>
        <li>
          <i className="fas fa-utensils"></i> Diet Plan
        </li>
        <li>
          <i className="fas fa-bullseye"></i> Goals
        </li>
        <li>
          <i className="fas fa-calendar-alt"></i> My Schedule
        </li>
        <li>
          <i className="fas fa-chart-line"></i> Progress
        </li>
      </ul>
      <div className="sidebar-footer">
        <a href="#help">
          <i className="fas fa-question-circle"></i> Help
        </a>
        <a href="#logout">
          <i className="fas fa-sign-out-alt"></i> Logout
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
