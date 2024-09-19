CREATE TABLE department (
    staff_id          INTEGER PRIMARY KEY,  -- Same as the employee ID (inherited)
    department        VARCHAR(50) NOT NULL, -- Department name
    wfh_quota         INTEGER NOT NULL DEFAULT 20,     -- Work From Home Quota for the department
    FOREIGN KEY (staff_id) REFERENCES employee(staff_id) ON DELETE CASCADE
);
-- Insert departments with a WFH quota of 20 for each department.
-- Insert department data with a WFH quota of 20 for each department
INSERT INTO department(staff_id, department, wfh_quota) 
VALUES 
(1, 'CEO', 20),
(2, 'Sales', 20),
(3, 'Solutioning', 20),
(4, 'Engineering', 20);


