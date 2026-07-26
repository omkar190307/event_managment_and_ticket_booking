USE event_management;

-- 1. Update existing events with image URLs
UPDATE EVENT SET Image_URL = '../images/techfest.png' WHERE Event_ID = 1;
UPDATE EVENT SET Image_URL = '../images/startup.png' WHERE Event_ID = 2;
UPDATE EVENT SET Image_URL = '../images/cloud.png' WHERE Event_ID = 3;
UPDATE EVENT SET Image_URL = '../images/leadership.png' WHERE Event_ID = 4;

-- 2. Insert new speaker
INSERT INTO SPEAKER (Name, Bio) VALUES ('Induja Mam', 'Expert Professor in Database Management Systems');
SET @speaker_id = LAST_INSERT_ID();

-- 3. Insert new venue
INSERT INTO VENUE (Name, Address, City, State, Zipcode, Capacity) VALUES ('REVA University', 'Room No 303 SVB Block', 'Bangalore', 'Karnataka', '560064', 150);
SET @venue_id = LAST_INSERT_ID();

-- 4. Insert new event
INSERT INTO EVENT (Name, Location, Date, Time, Description, Speaker_ID, Venue_ID, Category, Image_URL, Status) 
VALUES ('DBMS', 'Bangalore', '2026-09-10', '10:00:00', 'Advanced topics in Database Management Systems, schema design, and query optimization.', @speaker_id, @venue_id, 'Education', '../images/dbms.png', 'upcoming');
SET @event_id = LAST_INSERT_ID();

-- 5. Insert tickets for DBMS
INSERT INTO TICKET (Seat_Number, Type, Price, Event_ID) VALUES
('F1', 'VIP', 999.00, @event_id),
('F2', 'VIP', 999.00, @event_id),
('M1', 'General', 499.00, @event_id),
('M2', 'General', 499.00, @event_id),
('B1', 'Student', 199.00, @event_id),
('B2', 'Student', 199.00, @event_id),
('B3', 'Student', 199.00, @event_id);
