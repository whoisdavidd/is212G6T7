CREATE TABLE event (
    department VARCHAR(50) NOT NULL,
    event_name VARCHAR(50) NOT NULL,
    event_date VARCHAR(50) NOT NULL
);

INSERT INTO event (department, event_name, event_date)
VALUES
('IT', 'New Year Day', '2024-01-01'),
('Sales', 'Independence Day', '2024-07-04'),
('Accounting', 'Labor Day', '2024-09-02'),
('IT', 'Thanksgiving Day', '2024-11-28'),
('Sales', 'Christmas Day', '2024-12-25');
