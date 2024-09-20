CREATE TABLE department (
    staff_id          INTEGER PRIMARY KEY,  -- Same as the employee ID (inherited)
    department        VARCHAR(50) NOT NULL, -- Department name
    location          VARCHAR(50) NOT NULL, -- Location of the department
    wfh_quota         INTEGER NOT NULL DEFAULT 20,     -- Work From Home Quota for the department
    FOREIGN KEY (staff_id) REFERENCES employee(staff_id) ON DELETE CASCADE
);
-- Insert departments with a WFH quota of 20 for each department.
-- Insert department data with a WFH quota of 20 for each department
INSERT INTO department (staff_id, department, location, wfh_quota)
VALUES
(130002, 'CEO', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140001, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(150008, 'Solutioning', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(151408, 'Engineering', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140894, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140002, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140003, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140004, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140015, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140025, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140036, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140078, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140102, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140108, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140115, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140525, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20),
(140736, 'Sales', CASE WHEN random() < 0.5 THEN 'WFH' ELSE 'OFFICE' END, 20);



