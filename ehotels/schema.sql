-- =========================================
-- e-Hotels Schema
-- PostgreSQL
-- =========================================

-- Drop tables if re-running
DROP TABLE IF EXISTS ArchivedRenting CASCADE;
DROP TABLE IF EXISTS ArchivedBooking CASCADE;
DROP TABLE IF EXISTS Renting CASCADE;
DROP TABLE IF EXISTS Booking CASCADE;
DROP TABLE IF EXISTS EmployeeRole CASCADE;
DROP TABLE IF EXISTS Role CASCADE;
DROP TABLE IF EXISTS RoomAmenity CASCADE;
DROP TABLE IF EXISTS Amenity CASCADE;
DROP TABLE IF EXISTS Employee CASCADE;
DROP TABLE IF EXISTS Customer CASCADE;
DROP TABLE IF EXISTS Room CASCADE;
DROP TABLE IF EXISTS HotelContact CASCADE;
DROP TABLE IF EXISTS ChainContact CASCADE;
DROP TABLE IF EXISTS Hotel CASCADE;
DROP TABLE IF EXISTS HotelChain CASCADE;

-- =========================================
-- Core Tables
-- =========================================

CREATE TABLE HotelChain (
    ChainID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CentralOfficeAddress VARCHAR(255) NOT NULL
);

CREATE TABLE Hotel (
    HotelID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    HotelAddress VARCHAR(255) NOT NULL,
    CategoryStars INT NOT NULL CHECK (CategoryStars BETWEEN 1 AND 5),
    NumberOfRooms INT NOT NULL CHECK (NumberOfRooms >= 0),
    ChainID INT NOT NULL,
    ManagerEmployeeID INT UNIQUE,

    FOREIGN KEY (ChainID)
        REFERENCES HotelChain(ChainID)
        ON DELETE CASCADE
);

CREATE TABLE ChainContact (
    ChainContactID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ContactType VARCHAR(20) NOT NULL CHECK (ContactType IN ('Email', 'Phone')),
    ContactValue VARCHAR(255) NOT NULL,
    ChainID INT NOT NULL,

    FOREIGN KEY (ChainID)
        REFERENCES HotelChain(ChainID)
        ON DELETE CASCADE,

    UNIQUE (ChainID, ContactType, ContactValue)
);

CREATE TABLE HotelContact (
    HotelContactID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ContactType VARCHAR(20) NOT NULL CHECK (ContactType IN ('Email', 'Phone')),
    ContactValue VARCHAR(255) NOT NULL,
    HotelID INT NOT NULL,

    FOREIGN KEY (HotelID)
        REFERENCES Hotel(HotelID)
        ON DELETE CASCADE,

    UNIQUE (HotelID, ContactType, ContactValue)
);

CREATE TABLE Room (
    RoomID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Price NUMERIC(10,2) NOT NULL CHECK (Price > 0),
    Capacity VARCHAR(20) NOT NULL CHECK (Capacity IN ('Single', 'Double', 'Triple', 'Suite')),
    ViewType VARCHAR(20) NOT NULL CHECK (ViewType IN ('Sea', 'Mountain', 'None')),
    Extendable BOOLEAN NOT NULL,
    ProblemDamageNotes TEXT,
    HotelID INT NOT NULL,

    FOREIGN KEY (HotelID)
        REFERENCES Hotel(HotelID)
        ON DELETE CASCADE
);

CREATE TABLE Amenity (
    AmenityID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    AmenityName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Customer (
    CustomerID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    FullName VARCHAR(120) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    IDType VARCHAR(30) NOT NULL CHECK (IDType IN ('SSN', 'SIN', 'DrivingLicence', 'Passport')),
    IDNumber VARCHAR(50) NOT NULL,
    RegistrationDate DATE NOT NULL DEFAULT CURRENT_DATE,

    UNIQUE (IDType, IDNumber)
);

CREATE TABLE Employee (
    EmployeeID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    FullName VARCHAR(120) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    SSN_SIN VARCHAR(50) NOT NULL UNIQUE,
    HotelID INT NOT NULL,

    FOREIGN KEY (HotelID)
        REFERENCES Hotel(HotelID)
        ON DELETE CASCADE
);

CREATE TABLE Role (
    RoleID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE
);

-- =========================================
-- M:N Relationships
-- =========================================

CREATE TABLE RoomAmenity (
    RoomID INT NOT NULL,
    AmenityID INT NOT NULL,

    PRIMARY KEY (RoomID, AmenityID),

    FOREIGN KEY (RoomID)
        REFERENCES Room(RoomID)
        ON DELETE CASCADE,

    FOREIGN KEY (AmenityID)
        REFERENCES Amenity(AmenityID)
        ON DELETE CASCADE
);

CREATE TABLE EmployeeRole (
    EmployeeID INT NOT NULL,
    RoleID INT NOT NULL,

    PRIMARY KEY (EmployeeID, RoleID),

    FOREIGN KEY (EmployeeID)
        REFERENCES Employee(EmployeeID)
        ON DELETE CASCADE,

    FOREIGN KEY (RoleID)
        REFERENCES Role(RoleID)
        ON DELETE CASCADE
);

-- =========================================
-- Booking & Renting
-- =========================================

CREATE TABLE Booking (
    BookingID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    BookingCreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CustomerID INT NOT NULL,
    RoomID INT NOT NULL,

    CHECK (StartDate < EndDate),

    FOREIGN KEY (CustomerID)
        REFERENCES Customer(CustomerID)
        ON DELETE RESTRICT,

    FOREIGN KEY (RoomID)
        REFERENCES Room(RoomID)
        ON DELETE RESTRICT
);

CREATE TABLE Renting (
    RentingID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CheckInAt TIMESTAMP,
    CheckOutAt TIMESTAMP,
    CustomerID INT NOT NULL,
    RoomID INT NOT NULL,
    CheckInEmployeeID INT NOT NULL,
    BookingID INT UNIQUE,
    PaymentAmount NUMERIC(10,2),
    PaymentDate TIMESTAMP,

    CHECK (StartDate < EndDate),
    CHECK (CheckOutAt IS NULL OR CheckInAt IS NULL OR CheckInAt <= CheckOutAt),

    FOREIGN KEY (CustomerID)
        REFERENCES Customer(CustomerID)
        ON DELETE RESTRICT,

    FOREIGN KEY (RoomID)
        REFERENCES Room(RoomID)
        ON DELETE RESTRICT,

    FOREIGN KEY (CheckInEmployeeID)
        REFERENCES Employee(EmployeeID)
        ON DELETE RESTRICT,

    FOREIGN KEY (BookingID)
        REFERENCES Booking(BookingID)
        ON DELETE SET NULL
);

-- =========================================
-- Archive Tables (NO FKs)
-- =========================================

CREATE TABLE ArchivedBooking (
    ArchivedBookingID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    OriginalBookingID INT,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    SnapshotCustomerName VARCHAR(120) NOT NULL,
    SnapshotCustomerIDType VARCHAR(30) NOT NULL,
    SnapshotCustomerIDNumber VARCHAR(50) NOT NULL,
    SnapshotHotelAddress VARCHAR(255) NOT NULL,
    SnapshotRoomIdentifier VARCHAR(100) NOT NULL,
    SnapshotPriceAtTime NUMERIC(10,2) NOT NULL,

    CHECK (StartDate < EndDate)
);

CREATE TABLE ArchivedRenting (
    ArchivedRentingID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    OriginalRentingID INT,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    SnapshotCustomerName VARCHAR(120) NOT NULL,
    SnapshotCustomerIDType VARCHAR(30) NOT NULL,
    SnapshotCustomerIDNumber VARCHAR(50) NOT NULL,
    SnapshotHotelAddress VARCHAR(255) NOT NULL,
    SnapshotRoomIdentifier VARCHAR(100) NOT NULL,
    SnapshotPriceAtTime NUMERIC(10,2) NOT NULL,
    SnapshotCheckInEmployeeName VARCHAR(120),

    CHECK (StartDate < EndDate)
);

-- =========================================
-- Add Manager FK after Employee exists
-- =========================================

ALTER TABLE Hotel
ADD CONSTRAINT fk_hotel_manager
FOREIGN KEY (ManagerEmployeeID)
REFERENCES Employee(EmployeeID)
ON DELETE SET NULL;