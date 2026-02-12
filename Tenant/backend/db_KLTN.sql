create database KLTN;
use KLTN;

CREATE TABLE ACCOUNT (
    AccountID CHAR(10) PRIMARY KEY,
    Username VARCHAR(30) UNIQUE NOT NULL,
    Password CHAR(64) NOT NULL,
    Role ENUM('Tenant', 'Landlord', 'Admin') NOT NULL,
    Status ENUM('Active', 'Block') DEFAULT 'Active'
);

CREATE TABLE LANDLORD (
    LandlordID CHAR(10) PRIMARY KEY,
    AccountID CHAR(10),
    Name VARCHAR(50),
    Phone VARCHAR(15),
    Email VARCHAR(50),
    CreatedAt DATETIME,
    UpdatedAt DATETIME,
    FOREIGN KEY (AccountID) REFERENCES ACCOUNT(AccountID)
);

CREATE TABLE TENANT (
    TenantID CHAR(10) PRIMARY KEY,
    AccountID CHAR(10),
    Name VARCHAR(50),
    Age INT,
    Budget DECIMAL(10,2),
    Habit VARCHAR(255),
    Preference VARCHAR(255),
    Phone VARCHAR(15),
    Email VARCHAR(50),
    CreatedAt DATETIME,
    UpdatedAt DATETIME,
    FOREIGN KEY (AccountID) REFERENCES ACCOUNT(AccountID)
);

CREATE TABLE LOCATION (
    LocationID CHAR(10) PRIMARY KEY,
    Address VARCHAR(100),
    Ward VARCHAR(30),
    District VARCHAR(30),
    City VARCHAR(30),
    Latitude DECIMAL(8,6),
    Longitude DECIMAL(9,6)
);

CREATE TABLE ROOM_TYPE (
    RoomTypeID CHAR(10) PRIMARY KEY,
    Name VARCHAR(50),
    Description VARCHAR(255)
);
CREATE TABLE ROOM (
    RoomID CHAR(10) PRIMARY KEY,
    LandlordID CHAR(10),
    LocationID CHAR(10),
    RoomTypeID CHAR(10),
    Status ENUM('Trống', 'Đã thuê', 'Đã đặt lịch xem', 'Bảo trì', 'Sắp hết hợp đồng'),
    Price DECIMAL(10,2),
    Description VARCHAR(255),
    CreatedAt DATETIME,
    UpdatedAt DATETIME,
    FOREIGN KEY (LandlordID) REFERENCES LANDLORD(LandlordID),
    FOREIGN KEY (LocationID) REFERENCES LOCATION(LocationID),
    FOREIGN KEY (RoomTypeID) REFERENCES ROOM_TYPE(RoomTypeID)
);
INSERT INTO ROOM_TYPE VALUES
('RT01', 'Khép kín', 'Phòng riêng có WC'),
('RT02', 'Ở ghép', 'Phòng ở chung'),
('RT03', 'Studio', 'Phòng khép kín + bếp'),
('RT04', 'Duplex', 'Phòng 2 tầng'),
('RT05', 'Penthouse', 'Phòng cao cấp');

CREATE TABLE AMENITY (
    AmenityID CHAR(10) PRIMARY KEY,
    Name VARCHAR(50),
    Description VARCHAR(255)
);

CREATE TABLE ROOM_AMENITY (
    RoomID CHAR(10),
    AmenityID CHAR(10),
    PRIMARY KEY (RoomID, AmenityID),
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID),
    FOREIGN KEY (AmenityID) REFERENCES AMENITY(AmenityID)
);

CREATE TABLE ROOM_IMAGE (
    ImageID CHAR(10) PRIMARY KEY,
    RoomID CHAR(10),
    ImageURL VARCHAR(150),
    `Order` INT,
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID)
);

CREATE TABLE LISTING (
    ListingID CHAR(10) PRIMARY KEY,
    RoomID CHAR(10),
    LandlordID CHAR(10),
    Title VARCHAR(100),
    Description VARCHAR(255),
    CreatedAt DATETIME,
    UpdatedAt DATETIME,
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID),
    FOREIGN KEY (LandlordID) REFERENCES LANDLORD(LandlordID)
);

CREATE TABLE VIEWING_SCHEDULE (
    ScheduleID CHAR(10) PRIMARY KEY,
    TenantID CHAR(10),
    RoomID CHAR(10),
    DateTime DATETIME,
    Status ENUM('Chờ duyệt', 'Đã duyệt', 'Từ chối'),
    CreatedAt DATETIME,
    UpdatedAt DATETIME,
    FOREIGN KEY (TenantID) REFERENCES TENANT(TenantID),
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID)
);

CREATE TABLE CONTRACT (
    ContractID CHAR(10) PRIMARY KEY,
    TenantID CHAR(10),
    RoomID CHAR(10),
    StartDate DATE,
    EndDate DATE,
    Status ENUM('Đang thuê', 'Sắp hết hạn', 'Đã hết hợp đồng'),
    TotalPrice DECIMAL(10,2),
    Deposit DECIMAL(10,2),
    CreatedAt DATETIME,
    UpdatedAt DATETIME,
    FOREIGN KEY (TenantID) REFERENCES TENANT(TenantID),
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID)
);

CREATE TABLE PAYMENT (
    PaymentID CHAR(10) PRIMARY KEY,
    ContractID CHAR(10),
    PaymentDate DATE,
    Amount DECIMAL(10,2),
    Method ENUM('Tiền mặt', 'Chuyển khoản'),
    Status ENUM('Đã TT', 'Chưa TT'),
    FOREIGN KEY (ContractID) REFERENCES CONTRACT(ContractID)
);

CREATE TABLE AI_MATCHING (
    MatchingID CHAR(10) PRIMARY KEY,
    TenantID CHAR(10),
    RoomID CHAR(10),
    Score DECIMAL(5,2),
    Reason VARCHAR(255),
    CreatedAt DATETIME,
    FOREIGN KEY (TenantID) REFERENCES TENANT(TenantID),
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID)
);

CREATE TABLE REVIEW (
    ReviewID CHAR(10) PRIMARY KEY,
    RoomID CHAR(10),
    TenantID CHAR(10),
    Rating INT CHECK (Rating BETWEEN 1 AND 5),
    Content VARCHAR(200),
    ReviewDate DATE,
    FOREIGN KEY (RoomID) REFERENCES ROOM(RoomID),
    FOREIGN KEY (TenantID) REFERENCES TENANT(TenantID)
);

CREATE TABLE NOTIFICATION (
    NotificationID CHAR(10) PRIMARY KEY,
    TargetID CHAR(10),
    Content TEXT,
    Type ENUM('Hợp đồng', 'Phòng trống', 'Lịch xem'),
    CreatedAt DATETIME,
    Status ENUM('Đã đọc', 'Chưa đọc')
);



