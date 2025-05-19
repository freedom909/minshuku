# Google Sign-In Integration Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Setup Instructions](#setup-instructions)
3. [Testing Procedures](#testing-procedures)
4. [Debugging Guide](#debugging-guide)
5. [Common Issues](#common-issues)
6. [Monitoring](#monitoring)

## System Requirements

### Frontend
- Node.js v16+
- React v18+
- @react-oauth/google package
- Apollo Client

### Backend (subgraph-auths)
- Node.js v16+
- Apollo Server 4+
- google-auth-library
- jsonwebtoken

## Setup Instructions

### 1. Environment Configuration

**Frontend `.env.local`**:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:4001/graphql
```

**Backend `.env`**:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-secure-jwt-secret
```

### 2. Installation

```bash
# Frontend
cd frontend
npm install @react-oauth/google @apollo/client graphql

# Backend
cd subgraph-auths
npm install google-auth-library jsonwebtoken cors
```

## Testing Procedures

### 1. Automated Testing

```bash
# Run integration tests
node verify-integration.js

# Expected output:
# [SUCCESS] All tests passed!
# Test report saved to integration-test-report.json
```

### 2. Manual Testing

1. Start services:
```bash
node start-auth-services.js
```

2. Open browser to:
```
http://localhost:3000/login
```

3. Click Google Sign-In button
4. Verify:
   - Google OAuth popup appears
   - Backend logs show authentication request
   - User is redirected after login
   - LocalStorage contains auth tokens

## Debugging Guide

### Frontend Debugging
```javascript
// Check auth state
console.log('Auth state:', {
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId')
});

// Test backend connection
testBackendConnection().then(console.log);
```

### Backend Debugging
```javascript
// Add to resolvers.js
console.log('Auth request:', {
  input,
  headers: context.req.headers
});
```

## Common Issues

### 1. Google Button Not Appearing
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Check Google Cloud Console for authorized domains

### 2. CORS Errors
```javascript
// Backend CORS config
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```

### 3. Token Verification Failed
- Ensure same `JWT_SECRET` is used everywhere
- Verify token expiration time

## Monitoring

### Frontend Logs
- Check browser console
- Monitor network requests

### Backend Logs
```bash
# View logs
tail -f subgraph-auths/logs.txt

# Sample output:
# [INFO] Google Sign-In request received
# [DEBUG] Token verified for user: test@example.com
```

## Support

For additional help, contact:
- Frontend Issues: frontend-team@example.com
- Backend Issues: backend-team@example.com
- Google OAuth: cloud-support@google.com