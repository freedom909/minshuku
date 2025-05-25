// File: backend/src/utils/validators.js
export function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
      throw new Error(
        'Password must contain: 8+ characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&)'
      );
    }
    return true;
  }