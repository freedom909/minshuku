use air;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS listing_categories;
DROP TABLE IF EXISTS listing_amenities;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS categories;
SET FOREIGN_KEY_CHECKS=1;
-- Disable foreign key checks while creating tables
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(255),
  image VARCHAR(255) DEFAULT 'icon'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Locations
CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  zip VARCHAR(50),
  units VARCHAR(50),
  radius DECIMAL(10,2),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 3. Listings
CREATE TABLE IF NOT EXISTS listings (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  pictures JSON,
  numOfBeds INT,
  price FLOAT,
  isFeatured BOOLEAN DEFAULT FALSE,
  saleAmount FLOAT DEFAULT 0,
  checkInDate DATE,
  checkOutDate DATE,
  locationId VARCHAR(50),
  hostId VARCHAR(50),
  listingStatus VARCHAR(50) DEFAULT 'ACTIVE',
  locationType VARCHAR(50),
  FOREIGN KEY (locationId) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Amenities
CREATE TABLE IF NOT EXISTS amenities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  categoryId VARCHAR(50),
  description VARCHAR(255),
  locationId VARCHAR(50),
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (locationId) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Join table: listing_amenities
CREATE TABLE IF NOT EXISTS listing_amenities (
  listingId VARCHAR(50),
  amenityId VARCHAR(50),
  PRIMARY KEY (listingId, amenityId),
  FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (amenityId) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Join table: listing_categories
CREATE TABLE IF NOT EXISTS listing_categories (
  listingId VARCHAR(50),
  categoryId VARCHAR(50),
  PRIMARY KEY (listingId, categoryId),
  FOREIGN KEY (listingId) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ====================
-- Sample Seed Data
-- ====================

-- Categories
INSERT INTO categories (id, name, description, image) VALUES
('cat-1', 'Room', 'All rooms', 'icon'),
('cat-2', 'Kitchen', 'Kitchens', 'icon'),
('cat-3', 'Bathroom', 'Bathrooms', 'icon');

-- Locations
INSERT INTO locations 
(id, name, address, city, state, country, zip, units, radius, latitude, longitude) VALUES
('loc-1', 'Main Building', '123 Main St', 'Tokyo', 'Tokyo', 'Japan', '100-0001', 'km', 10.00, 35.6895, 139.6917),
('loc-2', 'Annex', '456 Side St', 'Tokyo', 'Tokyo', 'Japan', '100-0002', 'km', 10.00, 35.6925, 139.6947);


-- Listings
INSERT INTO listings (id, title, description, pictures, numOfBeds, price, isFeatured, saleAmount, checkInDate, checkOutDate, locationId, hostId, listingStatus, locationType) VALUES
('listing-1', 'Luxury Apartment', 'A very nice place', '["pic1.jpg","pic2.jpg"]', 2, 200, TRUE, 0, '2025-11-01', '2025-11-10', 'loc-1', 'host-1', 'ACTIVE', 'APARTMENT');

-- Amenities
INSERT INTO amenities (id, name, categoryId, description, locationId) VALUES
('am-1', 'WiFi', 'cat-1', 'High-speed internet', 'loc-1'),
('am-2', 'Air Conditioning', 'cat-2', 'Cool air', 'loc-1'),
('am-3', 'Shower', 'cat-3', 'Hot shower', 'loc-2');

-- Listing ↔ Amenities links
INSERT INTO listing_amenities (listingId, amenityId) VALUES
('listing-1', 'am-1'),
('listing-1', 'am-2');

-- Listing ↔ Categories links
INSERT INTO listing_categories (listingId, categoryId) VALUES
('listing-1', 'cat-1'),
('listing-1', 'cat-2');
