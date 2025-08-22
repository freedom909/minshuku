CREATE TABLE IF NOT EXISTS locations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  country VARCHAR(100)
  state VARCHAR(100),
  zip VARCHAR(20),
  units VARCHAR(50),
  radius DECIMAL(10,2),
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6)
) ENGINE=InnoDB;