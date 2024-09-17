CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    Staff_FName VARCHAR(100),
    Staff_LName VARCHAR(100),
    Dept VARCHAR(100),
    Position VARCHAR(100),
    Country VARCHAR(100),
    Email VARCHAR(150),
    Reporting_Manager int(100),
    Role int(100)
);
INSERT INTO staff (staff_id, Staff_FName, Staff_LName, Dept, Position, Country, Email, Reporting_Manager, Role)
VALUES
(130002, 'Jack', 'Sim', 'CEO', 'MD', 'Singapore', 'jack.sim@allinone.com.sg', 130002, 1),
(140001, 'Derek', 'Tan', 'Sales', 'Director', 'Singapore', 'Derek.Tan@allinone.com.sg', 130002, 3),
(150008, 'Eric', 'Loh', 'Solutioning', 'Director', 'Singapore', 'Eric.Loh@allinone.com.sg', 130002, 3),
(151408, 'Philip', 'Lee', 'Engineering', 'Director', 'Singapore', 'Philip.Lee@allinone.com.sg', 130002, 3),
(140894, 'Rahim', 'Khalid', 'Sales', 'Sales Manager', 'Singapore', 'Rahim.Khalid@allinone.com.sg', 140001, 3),
(140002, 'Susan', 'Goh', 'Sales', 'Account Manager', 'Singapore', 'Susan.Goh@allinone.com.sg', 140894, 2),
(140003, 'Janice', 'Chan', 'Sales', 'Account Manager', 'Singapore', 'Janice.Chan@allinone.com.sg', 140894, 2),
(140004, 'Mary', 'Teo', 'Sales', 'Account Manager', 'Singapore', 'Mary.Teo@allinone.com.sg', 140894, 2),
(140015, 'Oliva', 'Lim', 'Sales', 'Account Manager', 'Singapore', 'Oliva.Lim@allinone.com.sg', 140894, 2),
(140025, 'Emma', 'Heng', 'Sales', 'Account Manager', 'Singapore', 'Emma.Heng@allinone.com.sg', 140894, 2),
(140036, 'Charlotte', 'Wong', 'Sales', 'Account Manager', 'Singapore', 'Charlotte.Wong@allinone.com.sg', 140894, 2),
(140078, 'Amelia', 'Ong', 'Sales', 'Account Manager', 'Singapore', 'Amelia.Ong@allinone.com.sg', 140894, 2),
(140102, 'Eva', 'Yong', 'Sales', 'Account Manager', 'Singapore', 'Eva.Yong@allinone.com.sg', 140894, 2),
(140108, 'Liam', 'The', 'Sales', 'Account Manager', 'Singapore', 'Liam.The@allinone.com.sg', 140894, 2),
(140115, 'Noah', 'Ng', 'Sales', 'Account Manager', 'Singapore', 'Noah.Ng@allinone.com.sg', 140894, 2),
(140525, 'Oliver', 'Tan', 'Sales', 'Account Manager', 'Singapore', 'Oliver.Tan@allinone.com.sg', 140894, 2),
(140736, 'William', 'Fu', 'Sales', 'Account Manager', 'Singapore', 'William.Fu@allinone.com.sg', 140894, 2),
(140878, 'James', 'Tong', 'Sales', 'Account Manager', 'Singapore', 'James.Tong@allinone.com.sg', 140894, 2),
(140880, 'Heng', 'Chan', 'Sales', 'Account Manager', 'Singapore', 'Heng.Chan@allinone.com.sg', 140894, 2),
(140881, 'Rina', 'Tan', 'Sales', 'Account Manager', 'Singapore', 'Rina.Tan@allinone.com.sg', 140894, 2);
