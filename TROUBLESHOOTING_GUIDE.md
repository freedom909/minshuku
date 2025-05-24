# Google Sign-In Troubleshooting Guide

## Common Issues and Solutions

### 1. Google Sign-In Button Not Appearing
**Symptoms**:
- No Google Sign-In button is visible
- Console shows "Google script load error"

**Solutions**:
1. Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in frontend `.env.local`
2. Check the Google OAuth consent screen is properly configured in Google Cloud Console
3. Ensure the domain is authorized in Google Cloud Console

### 2. CORS Errors
**Symptoms**:
- Browser console shows CORS policy errors
- Network requests fail with CORS warnings

**Solutions**:
1. Verify backend CORS configuration:
```javascript
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```
2. Check the `Access-Control-Allow-Origin` header in responses
3. Ensure frontend and backend URLs match exactly

### 3. Authentication Token Issues
**Symptoms**:
- "Invalid token" errors in backend logs
- Authentication fails after successful Google Sign-In

**Solutions**:
1. Verify `GOOGLE_CLIENT_ID` matches between frontend and backend
2. Check token expiration time (default 1 hour)
3. Ensure JWT secret is consistent across services

### 4. No Backend Logs
**Symptoms**:
- Frontend makes requests but backend shows no logs
- Network tab shows failed requests

**Solutions**:
1. Verify backend is running on correct port (default 4010)
2. Check frontend `NEXT_PUBLIC_API_URL` matches backend URL
3. Test backend directly with curl:
```bash
curl -X POST http://localhost:4010/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}'
```

## Debugging Tools

### Frontend Debugging
1. **Browser DevTools**:
   - Network tab to inspect requests
   - Console for error messages
   - Application tab to check localStorage

2. **Logging**:
```javascript
console.log('Auth state:', {
  token: localStorage.getItem('token'),
  userId: localStorage.getItem('userId')
});
```

### Backend Debugging
1. **Request Logging**:
```javascript
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});
```

2. **Error Handling**:
```javascript
try {
  // Authentication logic
} catch (error) {
  console.error('Auth error:', {
    message: error.message,
    stack: error.stack
  });
}
```

## Testing Procedures

### 1. Unit Testing
```bash
npm test test-google-signin.js
```

### 2. Integration Testing
1. Start backend:
```bash
cd subgraph-auths && npm start
```

2. Start frontend:
```bash
cd frontend && npm run dev
```

3. Test flow:
- Click Google Sign-In button
- Select test account
- Verify:
  - Backend receives request
  - Token is generated
  - User is redirected

## Reset Procedures

### Full System Reset
1. Clear frontend storage:
```javascript
localStorage.clear();
```

2. Restart backend:
```bash
pkill -f "node index.js" && cd subgraph-auths && npm start
```

3. Hard refresh frontend (Ctrl+F5)

## Support Contacts
- Backend Issues: backend-team@example.com
- Frontend Issues: frontend-team@example.com
- Google OAuth: cloud-support@google.com