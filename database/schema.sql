-- =============================================
-- EVENT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =============================================

DROP DATABASE IF EXISTS event_management;
CREATE DATABASE event_management;
USE event_management;

-- USER TABLE (with mobile number)
CREATE TABLE IF NOT EXISTS USER (
    User_ID    INT AUTO_INCREMENT PRIMARY KEY,
    Name       VARCHAR(100) NOT NULL,
    Email      VARCHAR(150) UNIQUE NOT NULL,
    Mobile     VARCHAR(15)  UNIQUE,
    Password   VARCHAR(255) NOT NULL,
    User_type  ENUM('admin', 'user') DEFAULT 'user',
    Avatar     VARCHAR(500) DEFAULT NULL,
    Is_active  TINYINT(1) DEFAULT 1,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SPEAKER TABLE
CREATE TABLE IF NOT EXISTS SPEAKER (
    Speaker_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name       VARCHAR(100) NOT NULL,
    Bio        TEXT
);

-- VENUE TABLE
CREATE TABLE IF NOT EXISTS VENUE (
    Venue_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name     VARCHAR(150) NOT NULL,
    Address  VARCHAR(255),
    City     VARCHAR(100),
    State    VARCHAR(100),
    Zipcode  VARCHAR(20),
    Capacity INT
);

-- EVENT TABLE
CREATE TABLE IF NOT EXISTS EVENT (
    Event_ID    INT AUTO_INCREMENT PRIMARY KEY,
    Name        VARCHAR(200) NOT NULL,
    Location    VARCHAR(255),
    Date        DATE NOT NULL,
    Time        TIME NOT NULL,
    Description TEXT,
    Speaker_ID  INT,
    Venue_ID    INT,
    Image_URL   VARCHAR(500),
    Category    VARCHAR(100) DEFAULT 'General',
    Status      ENUM('upcoming','ongoing','completed','cancelled') DEFAULT 'upcoming',
    FOREIGN KEY (Speaker_ID) REFERENCES SPEAKER(Speaker_ID) ON DELETE SET NULL,
    FOREIGN KEY (Venue_ID)   REFERENCES VENUE(Venue_ID)   ON DELETE SET NULL
);

-- ORDER TABLE
CREATE TABLE IF NOT EXISTS `ORDER` (
    Order_ID    INT AUTO_INCREMENT PRIMARY KEY,
    Date        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Total_Price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    User_ID     INT NOT NULL,
    Status      ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
    FOREIGN KEY (User_ID) REFERENCES USER(User_ID) ON DELETE CASCADE
);

-- TICKET TABLE
CREATE TABLE IF NOT EXISTS TICKET (
    Ticket_ID   INT AUTO_INCREMENT PRIMARY KEY,
    Seat_Number VARCHAR(20),
    Type        ENUM('VIP','General','Student') DEFAULT 'General',
    Price       DECIMAL(10,2) NOT NULL,
    Event_ID    INT NOT NULL,
    Order_ID    INT,
    FOREIGN KEY (Event_ID)  REFERENCES EVENT(Event_ID)   ON DELETE CASCADE,
    FOREIGN KEY (Order_ID)  REFERENCES `ORDER`(Order_ID) ON DELETE SET NULL
);

-- PAYMENT TABLE
CREATE TABLE IF NOT EXISTS PAYMENT (
    Payment_ID     INT AUTO_INCREMENT PRIMARY KEY,
    Transaction_ID VARCHAR(100) UNIQUE NOT NULL,
    Payment_Method ENUM('Credit Card','Debit Card','UPI','Net Banking','Wallet') DEFAULT 'UPI',
    Payment_Date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status         ENUM('pending','success','failed') DEFAULT 'pending',
    Order_ID       INT NOT NULL,
    FOREIGN KEY (Order_ID) REFERENCES `ORDER`(Order_ID) ON DELETE CASCADE
);

-- =============================================
-- SAMPLE DATA
-- =============================================

INSERT INTO SPEAKER (Name, Bio) VALUES
('Dr. Rajesh Kumar',  'IIT Delhi professor with 15+ years in AI/ML research.'),
('Priya Sharma',      'Award-winning startup founder and TEDx speaker.'),
('Arjun Mehta',       'Lead Developer at Google India, expert in cloud computing.'),
('Neha Gupta',        'Serial entrepreneur and Forbes 30 Under 30 honoree.'),
('Indhuja Mam',       'Expert Professor in Database Management Systems');

INSERT INTO VENUE (Name, Address, City, State, Zipcode, Capacity) VALUES
('Pragati Maidan',          'Mathura Road',               'New Delhi',  'Delhi',       '110001', 5000),
('Bombay Exhibition Centre','Goregaon East',               'Mumbai',     'Maharashtra', '400063', 8000),
('HICC',                    'Novotel Compound, Hitec City','Hyderabad',  'Telangana',   '500081', 3000),
('The Lalit Ashok',         'Kumara Krupa High Grounds',  'Bangalore',  'Karnataka',   '560001', 1500),
('REVA University',         'Room No 303 SVB Block',      'Bangalore',  'Karnataka',   '560064', 150);

INSERT INTO EVENT (Name, Location, Date, Time, Description, Speaker_ID, Venue_ID, Category, Image_URL, Status) VALUES
('TechFest 2026',          'New Delhi', '2026-06-15', '10:00:00', 'India biggest tech conference with industry leaders discussing the future of AI, cloud, and Web3.', 1, 1, 'Technology', '../images/techfest.png', 'upcoming'),
('Startup Summit India',   'Mumbai',    '2026-07-20', '09:00:00', 'Connect with 500+ startups, VCs, and mentors at the largest startup event of the year.',            2, 2, 'Business',   '../images/startup.png', 'upcoming'),
('Cloud Computing Workshop','Hyderabad', '2026-06-28', '11:00:00', 'Hands-on workshop on AWS, Azure and GCP with live coding sessions.',                               3, 3, 'Workshop',   '../images/cloud.png', 'upcoming'),
('Women in Leadership Forum','Bangalore','2026-08-05', '10:00:00', 'Empowering women in tech and business with keynotes, panels, and networking.',                      4, 4, 'Leadership', '../images/leadership.png', 'upcoming'),
('DBMS', 'Bangalore', '2026-09-10', '10:00:00', 'Advanced topics in Database Management Systems, schema design, and query optimization.', 5, 5, 'Education', '../images/dbms.png', 'upcoming');

INSERT INTO TICKET (Seat_Number, Type, Price, Event_ID) VALUES
('A1','VIP',    4999.00, 1), ('A2','VIP',    4999.00, 1),
('B1','General',1499.00, 1), ('B2','General',1499.00, 1),
('C1','Student', 499.00, 1), ('C2','Student', 499.00, 1),
('A1','VIP',    5999.00, 2), ('B1','General',1999.00, 2), ('C1','Student', 799.00, 2),
('A1','VIP',    2999.00, 3), ('B1','General', 999.00, 3), ('C1','Student', 299.00, 3),
('A1','VIP',    3499.00, 4), ('B1','General',1199.00, 4), ('C1','Student', 399.00, 4),
('F1','VIP',     999.00, 5), ('F2','VIP',     999.00, 5),
('M1','General', 499.00, 5), ('M2','General', 499.00, 5),
('B1','Student', 199.00, 5), ('B2','Student', 199.00, 5), ('B3','Student', 199.00, 5);

-- Default admin (password: Admin@123)
INSERT INTO USER (Name, Email, Mobile, Password, User_type) VALUES
('Admin User', 'admin@eventpro.com', '9999999999',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
