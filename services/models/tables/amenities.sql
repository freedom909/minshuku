CREATE TABLE IF NOT EXISTS amenities (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  categoryId VARCHAR(50),
  description VARCHAR(255),
  locationId VARCHAR(50),
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (locationId) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB;
