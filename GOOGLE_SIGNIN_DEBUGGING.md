# Google Sign-In Integration Debugging Guide

## 1. Environment Setup

### Frontend Requirements
```bash
# Install required packages
npm install @react-oauth/google @apollo/client graphql
```

### Backend Requirements
```bash
# Install required packages
npm install google-auth-library jsonwebtoken cors
```

## 2. Configuration Files

### Frontend `.env.local`
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_URL=http://localhost:4010/graphql
```

### Backend `.env`
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
JWT_SECRET=minshuku_jwt_secret_key_2024_secure_random_string

```

## 3. Debugging Checklist

### Frontend Issues
1. **Google button not appearing**
   - Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
   - Check browser console for Google script errors

2. **No request to backend**
   - Check Network tab in DevTools
   - Verify Apollo Client is configured correctly

3. **Authentication state not persisting**
   - Check localStorage for auth tokens
   - Verify AuthContext implementation

### Backend Issues
1. **No logs when clicking sign-in**
   - Check CORS configuration
   - Verify server is running on correct port

2. **Token verification failures**
   - Verify Google Client IDs match
   - Check JWT secret consistency

3. **Database issues**
   - Check user creation logic
   - Verify database connection

## 4. Testing Commands

### Frontend Testing
```bash
# Test backend connection
curl -X POST http://localhost:4010/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}'
```

### Backend Testing
```bash
# Test Google token verification
node -e "const {OAuth2Client} = require('google-auth-library'); \
  const client = new OAuth2Client('YOUR_CLIENT_ID'); \
  client.verifyIdToken({idToken: 'TEST_TOKEN', audience: 'YOUR_CLIENT_ID'}) \
    .then(ticket => console.log(ticket.getPayload())) \
    .catch(console.error);"
```

## 5. Common Error Messages

| Error | Solution |
|-------|----------|
| `Invalid Credentials` | Verify Google Client ID matches |
| `CORS Error` | Check backend CORS configuration |
| `JWT Verification Failed` | Ensure same JWT_SECRET is used |
| `No Authentication Token` | Check token generation logic |

## 6. Monitoring Logs

### Frontend Logs
```javascript
// Add to your components
console.log('Auth state:', {
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId')
});
```

### Backend Logs
```javascript
// Add to resolvers
console.log('Auth request:', {
  input,
  headers: context.req.headers
});
```

## 7. Reset Procedures

```bash
# Frontend reset
rm -rf node_modules package-lock.json
npm install

# Backend reset
rm -rf node_modules package-lock.json
npm install
```