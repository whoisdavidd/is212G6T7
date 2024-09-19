CREATE TABLE wfh (
    staff_id          INTEGER,  -- Same as the employee ID (inherited)
    department        VARCHAR(50) NOT NULL, -- Department name
    event_id          INTEGER, -- Unique ID for the event
    event_name        VARCHAR(50) NOT NULL,  -- Name of the event
    event_date        DATE NOT NULL,       -- Date of the event
    reporting_manager VARCHAR(50),        -- Name of the reporting manager
    reporting_manager_id INTEGER,          -- ID of the reporting manager (from employee table)
    approve_status    VARCHAR(50),         -- Type of the event

    FOREIGN KEY (event_id) REFERENCES event(event_id) ON DELETE CASCADE,  -- Correct FK reference
    FOREIGN KEY (staff_id) REFERENCES employee(staff_id) ON DELETE CASCADE  
);
