CREATE TABLE event (
   event_id          SERIAL PRIMARY KEY,  -- Auto-incrementing unique event ID
   staff_id          INTEGER NOT NULL,    -- Foreign key to employee table
   event_name        VARCHAR(50) NOT NULL,  -- Name of the event
   event_date        DATE NOT NULL,       -- Date of the event
   reporting_manager VARCHAR(50),        -- Name of the reporting manager
   reporting_manager_id INTEGER,          -- ID of the reporting manager (from employee table)
   department        VARCHAR(50),         -- Department of the staff
   event_type        VARCHAR(50),         -- Type of the event
   
   FOREIGN KEY (staff_id) REFERENCES employee(staff_id) ON DELETE CASCADE
);
