import AuthError from '../utils/authError.js';

// ... existing code ...
if (!this.localAuthService) {
  throw new AuthError('Local authentication service is not configured', 'SERVICE_UNAVAILABLE');
}