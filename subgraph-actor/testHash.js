import { compare } from 'bcrypt';
import bcrypt from 'bcrypt';
// Hashed password from database
const hashedPassword = '$2b$10$qxGuA3kJH2Ky2Yjq769qyOVfPMA7sc7io4j1Gofmfgp2oPfmMY2Si';

// Password to test
const plainPassword = 'currentPassword123';

compare(plainPassword, hashedPassword, (err, result) => {
  if (err) {
    console.error('Error comparing password:', err);
  } else {
    console.log('Password comparison result:', result); // Should be true if passwords match
  }
});


// Plain text password
const password = 'currentPassword123';

// Hash the password
bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hash);
    // Store `hash` in the database
  }
});
