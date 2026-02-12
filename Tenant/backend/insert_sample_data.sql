-- Thêm dữ liệu mẫu vào database KLTN
USE KLTN;

-- Thêm tài khoản mẫu (password: 123456)
INSERT INTO ACCOUNT (AccountID, Username, Password, Role, Status) VALUES
('ACC0000001', 'tenant01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tenant', 'Active'),
('ACC0000002', 'landlord01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Landlord', 'Active'),
('ACC0000003', 'admin01', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Active');

-- Thêm thông tin Tenant
INSERT INTO TENANT (TenantID, AccountID, Name, Age, Budget, Phone, Email, CreatedAt, UpdatedAt) VALUES
('TEN0000001', 'ACC0000001', 'Nguyễn Văn A', 25, 5000000, '0912345678', 'tenant01@gmail.com', NOW(), NOW());

-- Thêm thông tin Landlord
INSERT INTO LANDLORD (LandlordID, AccountID, Name, Phone, Email, CreatedAt, UpdatedAt) VALUES
('LAN0000001', 'ACC0000002', 'Trần Thị B', '0987654321', 'landlord01@gmail.com', NOW(), NOW());

-- Kiểm tra dữ liệu
SELECT 
    a.AccountID, 
    a.Username, 
    a.Role, 
    a.Status,
    COALESCE(t.Name, l.Name) as Name,
    COALESCE(t.Email, l.Email) as Email
FROM ACCOUNT a
LEFT JOIN TENANT t ON a.AccountID = t.AccountID
LEFT JOIN LANDLORD l ON a.AccountID = l.AccountID;
