-- Kreiranje tabele Role
CREATE TABLE Role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    naziv ENUM('user', 'admin') NOT NULL
);
-- Kreiranje tabele User
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ime VARCHAR(50) NOT NULL,
    prezime VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    datum_rodjenja DATE NOT NULL,
    urlSlike VARCHAR(255),
    isActive BOOLEAN DEFAULT 1,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES Role(id)
);
-- Kreiranje tabele Verified
CREATE TABLE Verified (
    user_id INT PRIMARY KEY,
    isVerificated BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES User(id)
);
-- Kreiranje tabele TwoFactor
CREATE TABLE TwoFactor (
    user_id INT PRIMARY KEY,
    isEnabled BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES User(id)
);