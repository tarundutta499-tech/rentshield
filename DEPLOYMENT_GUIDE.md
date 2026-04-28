# RentShield Payment Feature Deployment Guide

## Overview
This guide covers the complete implementation of Cashfree payment integration for RentShield SaaS platform.

## Backend Implementation

### 1. Firebase Cloud Function
**File:** `functions/createOrder/index.js`

**Features:**
- ✅ Accepts POST requests only
- ✅ Reads amount, customerId, customerEmail, customerPhone from req.body
- ✅ Defaults amount to 149 if not provided
- ✅ Auto-generates missing customer details with fallback values
- ✅ Calls Cashfree API with proper headers
- ✅ Returns clean JSON response
- ✅ Proper error handling and logging
- ✅ CORS enabled using cors package
- ✅ Environment variables for security

### 2. Dependencies
**File:** `functions/package.json`

**Added:**
- `cors: ^2.8.5` - CORS support
- `node-fetch: ^3.3.2` - HTTP requests

## Frontend Implementation

### 1. Payment Button Component
**File:** `apps/web/src/components/PaymentButton.jsx`

**Features:**
- ✅ Calls Firebase function using fetch POST
- ✅ Sends amount: 149 in request body
- ✅ Receives payment_session_id response
- ✅ Initializes Cashfree SDK with sandbox mode
- ✅ Opens payment popup with redirectTarget: "_modal"
- ✅ Handles success/failure callbacks
- ✅ Disables button while processing
- ✅ Shows proper console logs
- ✅ No secrets exposed in frontend

### 2. Cashfree SDK Integration
```javascript
// SDK Loading
const cashfree = new Cashfree({ mode: "sandbox" });

// Payment Popup
cashfree.checkout({
  paymentSessionId,
  redirectTarget: "_modal"
});

// Cashfree v3 SDK - no event listeners needed
// Payment events are handled by redirect URLs
```

## Security Implementation

### 1. Environment Variables
**File:** `functions/.env.example`

**Variables:**
- `CASHFREE_APP_ID` - Cashfree application ID
- `CASHFREE_SECRET_KEY` - Cashfree secret key
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PROJECT_LOCATION` - Firebase project location

### 2. Security Measures
- ✅ No secrets exposed in frontend code
- ✅ Environment variables used in backend
- ✅ CORS properly configured
- ✅ Input validation and sanitization
- ✅ Error handling without exposing sensitive data

## Deployment Steps

### 1. Backend Deployment
```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your actual Cashfree credentials

# Deploy to Firebase
firebase deploy --only functions
```

### 2. Frontend Integration
```javascript
// Import PaymentButton component
import PaymentButton from './components/PaymentButton';

// Use in your component
function YourComponent() {
  return (
    <PaymentButton />
  );
}
```

## API Endpoints

### Firebase Function
- **URL:** `https://us-central1-rental-shield-a4638.cloudfunctions.net/createOrder`
- **Method:** POST
- **Headers:** Content-Type: application/json
- **Request Body:**
  ```json
  {
    "amount": 149,
    "customerId": {
      "name": "RentShield User",
      "email": "user@rentshield.com"
    },
    "customerEmail": "user@rentshield.com",
    "customerPhone": "9999999999"
  }
  ```
- **Response:**
  ```json
  {
    "payment_session_id": "session_123456",
    "order_id": "order_123456_abc123"
  }
  ```

### Cashfree API
- **URL:** `https://sandbox.cashfree.com/pg/orders`
- **Method:** POST
- **Headers:**
  - `x-client-id`: Your Cashfree App ID
  - `x-client-secret`: Your Cashfree Secret Key
  - `x-api-version`: 2023-08-01
  - `Content-Type`: application/json

## Testing

### 1. Backend Testing
```bash
# Test Firebase function locally
firebase emulators:start --only functions

# Test with curl
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"amount": 149, "customerEmail": "test@example.com"}' \
  http://localhost:5001/rental-shield-a4638/us-central1/createOrder
```

### 2. Frontend Testing
- Load payment page
- Click payment button
- Verify Cashfree popup opens
- Test payment flow in sandbox mode
- Check console logs for debugging

## Error Handling

### Common Errors & Solutions
1. **CORS Error**: Ensure cors() is properly configured
2. **Missing Environment Variables**: Check .env file setup
3. **Cashfree API Error**: Verify credentials and API URL
4. **SDK Loading Error**: Check internet connection and script URL
5. **Payment Failure**: Check Cashfree dashboard for transaction status

## Production Checklist

### Before Going Live
- [ ] Replace sandbox with production Cashfree URLs
- [ ] Update environment variables with production credentials
- [ ] Test end-to-end payment flow
- [ ] Verify webhook handling (if applicable)
- [ ] Monitor logs for errors
- [ ] Set up monitoring and alerts

### Security Review
- [ ] Environment variables are properly secured
- [ ] No hardcoded secrets in frontend
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented (if needed)
- [ ] HTTPS enforced everywhere
- [ ] Error messages don't expose sensitive information

## Support

### Cashfree Documentation
- [Cashfree API Docs](https://docs.cashfree.com)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)

### Common Issues
1. **Payment popup blocked**: Check browser popup settings
2. **Invalid amount**: Ensure amount is valid number
3. **Network errors**: Check internet connection
4. **Function timeout**: Optimize function performance
5. **SDK conflicts**: Ensure no multiple SDK instances

## Monitoring

### Key Metrics to Track
- Payment success rate
- Payment failure rate
- Average transaction time
- Error frequency by type
- User drop-off points in payment flow

### Log Analysis
```bash
# View Firebase function logs
firebase functions:log

# Filter for specific errors
firebase functions:log --only createOrder
```
