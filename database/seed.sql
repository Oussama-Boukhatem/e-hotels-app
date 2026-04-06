-- =========================================
-- e-Hotels Seed Data
-- =========================================

-- 1. Hotel Chains
INSERT INTO HotelChain (CentralOfficeAddress) VALUES
('100 King St W, Toronto, ON'),
('200 Rue Sainte-Catherine O, Montreal, QC'),
('300 Robson St, Vancouver, BC'),
('400 Jasper Ave, Edmonton, AB'),
('500 Portage Ave, Winnipeg, MB');

-- 2. Hotels (8 per chain = 40 total)
INSERT INTO Hotel (HotelAddress, CategoryStars, NumberOfRooms, ChainID, ManagerEmployeeID)
SELECT
    'Hotel ' || c.ChainID || '-' || h.num || ', ' ||
    CASE
        WHEN h.num IN (1,2) THEN 'Downtown Toronto'
        WHEN h.num IN (3,4) THEN 'Montreal Central'
        WHEN h.num IN (5,6) THEN 'Vancouver West'
        ELSE 'Ottawa Core'
    END,
    CASE
        WHEN h.num IN (1,4,7) THEN 3
        WHEN h.num IN (2,5,8) THEN 4
        ELSE 5
    END,
    5,
    c.ChainID,
    NULL
FROM HotelChain c
CROSS JOIN generate_series(1,8) AS h(num);

-- 3. Chain Contacts
INSERT INTO ChainContact (ContactType, ContactValue, ChainID)
SELECT 'Email', 'chain' || ChainID || '@ehotels.com', ChainID FROM HotelChain;

INSERT INTO ChainContact (ContactType, ContactValue, ChainID)
SELECT 'Phone', '555-100-' || LPAD(ChainID::text, 4, '0'), ChainID FROM HotelChain;

-- 4. Hotel Contacts
INSERT INTO HotelContact (ContactType, ContactValue, HotelID)
SELECT 'Email', 'hotel' || HotelID || '@ehotels.com', HotelID FROM Hotel;

INSERT INTO HotelContact (ContactType, ContactValue, HotelID)
SELECT 'Phone', '555-200-' || LPAD(HotelID::text, 4, '0'), HotelID FROM Hotel;

-- 5. Amenities
INSERT INTO Amenity (AmenityName) VALUES
('TV'),
('AirConditioning'),
('Fridge'),
('WiFi'),
('Balcony'),
('MiniBar');

-- 6. Rooms (5 per hotel = 200 rooms)
INSERT INTO Room (Price, Capacity, ViewType, Extendable, ProblemDamageNotes, HotelID)
SELECT
    CASE r.num
        WHEN 1 THEN 120.00
        WHEN 2 THEN 150.00
        WHEN 3 THEN 180.00
        WHEN 4 THEN 220.00
        ELSE 300.00
    END,
    CASE r.num
        WHEN 1 THEN 'Single'
        WHEN 2 THEN 'Double'
        WHEN 3 THEN 'Triple'
        WHEN 4 THEN 'Suite'
        ELSE 'Double'
    END,
    CASE
        WHEN r.num IN (1,4) THEN 'Sea'
        WHEN r.num IN (2,5) THEN 'Mountain'
        ELSE 'None'
    END,
    CASE WHEN r.num IN (3,4,5) THEN TRUE ELSE FALSE END,
    NULL,
    h.HotelID
FROM Hotel h
CROSS JOIN generate_series(1,5) AS r(num);

-- 7. Room Amenities (M:N)
INSERT INTO RoomAmenity (RoomID, AmenityID)
SELECT RoomID, 1 FROM Room;

INSERT INTO RoomAmenity (RoomID, AmenityID)
SELECT RoomID, 4 FROM Room;

INSERT INTO RoomAmenity (RoomID, AmenityID)
SELECT RoomID, 2 FROM Room WHERE Capacity IN ('Double','Triple','Suite');

INSERT INTO RoomAmenity (RoomID, AmenityID)
SELECT RoomID, 3 FROM Room WHERE Price >= 180;

INSERT INTO RoomAmenity (RoomID, AmenityID)
SELECT RoomID, 5 FROM Room WHERE ViewType <> 'None';

-- 8. Roles
INSERT INTO Role (RoleName) VALUES
('Manager'),
('Receptionist'),
('Cleaner'),
('Clerk');

-- 9. Employees (2 per hotel)
INSERT INTO Employee (FullName, Address, SSN_SIN, HotelID)
SELECT
    'Manager ' || HotelID,
    'Address M ' || HotelID,
    'SIN-M-' || HotelID,
    HotelID
FROM Hotel;

INSERT INTO Employee (FullName, Address, SSN_SIN, HotelID)
SELECT
    'Receptionist ' || HotelID,
    'Address R ' || HotelID,
    'SIN-R-' || HotelID,
    HotelID
FROM Hotel;

-- 10. Assign Roles
INSERT INTO EmployeeRole (EmployeeID, RoleID)
SELECT e.EmployeeID, r.RoleID
FROM Employee e
JOIN Role r ON r.RoleName = 'Manager'
WHERE e.SSN_SIN LIKE 'SIN-M-%';

INSERT INTO EmployeeRole (EmployeeID, RoleID)
SELECT e.EmployeeID, r.RoleID
FROM Employee e
JOIN Role r ON r.RoleName = 'Receptionist'
WHERE e.SSN_SIN LIKE 'SIN-R-%';

-- 11. Assign Managers to Hotels
UPDATE Hotel h
SET ManagerEmployeeID = e.EmployeeID
FROM Employee e
WHERE e.HotelID = h.HotelID
AND e.SSN_SIN = 'SIN-M-' || h.HotelID;

-- 12. Customers
INSERT INTO Customer (FullName, Address, IDType, IDNumber, RegistrationDate) VALUES
('Alice Martin', 'Toronto', 'SIN', 'C001', CURRENT_DATE),
('Bob Chen', 'Ottawa', 'Passport', 'C002', CURRENT_DATE),
('Sara Khan', 'Montreal', 'DrivingLicence', 'C003', CURRENT_DATE),
('David Roy', 'Vancouver', 'SIN', 'C004', CURRENT_DATE),
('Maya Ali', 'Edmonton', 'Passport', 'C005', CURRENT_DATE);

-- 13. Bookings
INSERT INTO Booking (StartDate, EndDate, BookingCreatedAt, CustomerID, RoomID) VALUES
('2026-03-25','2026-03-28',CURRENT_TIMESTAMP,1,1),
('2026-03-26','2026-03-29',CURRENT_TIMESTAMP,2,6),
('2026-04-01','2026-04-05',CURRENT_TIMESTAMP,3,11),
('2026-04-02','2026-04-06',CURRENT_TIMESTAMP,4,16);

-- 14. Rentings
INSERT INTO Renting (StartDate, EndDate, CheckInAt, CheckOutAt, CustomerID, RoomID, CheckInEmployeeID, BookingID) VALUES
('2026-03-25','2026-03-28',CURRENT_TIMESTAMP,NULL,1,1,2,1),
('2026-03-27','2026-03-30',CURRENT_TIMESTAMP,NULL,5,21,4,NULL);

-- =========================================
-- DONE
-- =========================================