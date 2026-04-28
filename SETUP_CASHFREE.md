# Cashfree Payment Gateway Setup Guide

## Issue: Payment option not working because test credentials are used

## Solution: Configure actual Cashfree credentials

### Step 1: Get Your Cashfree Credentials

1. Go to [Cashfree Dashboard](https://dashboard.cashfree.com)
2. Sign up/login to your account
3. Navigate to **Settings** > **API Keys**
4. Copy your **App ID** and **Secret Key**
5. For testing, use **Sandbox** credentials
6. For production, use **Live** credentials

### Step 2: Configure Firebase Environment Variables

Run these commands in your terminal (replace with your actual credentials):

```bash
# Navigate to functions directory
cd c:/Users/HP/OneDrive/Desktop/rentshield/functions

# Set your Cashfree credentials
firebase functions:config:set cashfree.app_id="YOUR_ACTUAL_APP_ID" cashfree.secret_key="YOUR_ACTUAL_SECRET_KEY"

# Deploy the updated functions
firebase deploy --only functions
```

### Step 3: Update the Firebase Function

The createOrder function now uses:
```javascript
const CASHFREE_APP_ID = functions.config().cashfree?.app_id;
const CASHFREE_SECRET_KEY = functions.config().cashfree?.secret_key;
```

### Step 4: Test the Payment Integration

1. Open your RentShield dashboard
2. Click "Review & Improve" on any agreement
3. You should see the "Unlock Full Analysis" section
4. Click the "Upgrade Now" button
5. Cashfree payment popup should open
6. Complete the payment to unlock premium features

### Step 5: Verify the Payment Flow

- **Before payment**: Premium features are blurred
- **After payment**: Premium features become clear and accessible
- **Console logs**: Check for payment success/failure messages

### Common Issues & Solutions

1. **Payment button not working**: 
   - Check if Firebase functions are deployed
   - Verify Cashfree credentials are set correctly

2. **Cashfree popup not opening**:
   - Check internet connection
   - Verify Cashfree SDK is loading
   - Check console for errors

3. **Payment failing**:
   - Verify Cashfree credentials are correct
   - Check if you're using sandbox or live mode
   - Check Cashfree dashboard for transaction status

### Environment Variables Format

```bash
# For Sandbox (Testing)
firebase functions:config:set cashfree.app_id="TEST123456789" cashfree.secret_key="test_secret_key_123"

# For Production (Live)
firebase functions:config:set cashfree.app_id="LIVE123456789" cashfree.secret_key="live_secret_key_456"
```

### Where to Find Cashfree Credentials

1. **Sandbox (Testing)**:
   - Go to Cashfree Dashboard
   - Click on **Sandbox** mode
   - Navigate to **Settings** > **API Keys**
   - Copy Sandbox App ID and Secret Key

2. **Production (Live)**:
   - Go to Cashfree Dashboard
   - Click on **Live** mode
   - Navigate to **Settings** > **API Keys**
   - Copy Live App ID and Secret Key

### Next Steps

1. Get your actual Cashfree credentials
2. Run the Firebase config commands
3. Deploy the functions
4. Test the payment flow
5. Verify premium features unlock

The payment option will work once you configure your actual Cashfree credentials!
