import React, { useState } from 'react';

export default function PaymentButton() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCashfreeLoaded, setIsCashfreeLoaded] = useState(false);
  const [error, setError] = useState(false);

  console.log("NEW BUILD LOADED v3 - CLEAN INTEGRATION");

  // Debug: Track alert source
  React.useEffect(() => {
    const originalAlert = window.alert;
    window.alert = function(message) {
      console.error('🚨 ALERT CALLED FROM:', new Error().stack);
      console.error('🚨 ALERT MESSAGE:', message);
      return originalAlert.call(this, message);
    };
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      setIsCashfreeLoaded(true);
      console.log('✅ Cashfree SDK loaded');
    };
    script.onerror = () => {
      console.error('❌ Failed to load Cashfree SDK');
      setError(true);
    };
    document.head.appendChild(script);
  }, []);

  const handlePayment = async () => {
    // Reset error state
    setError(false);
    setIsProcessing(true);

    try {
      console.log('🔄 Starting payment initialization...');

      // Step 1: Create payment session
      const response = await fetch("https://us-central1-rental-shield-a4638.cloudfunctions.net/createOrder", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Backend response:', data);

      // Step 2: Validate payment session
      if (!data.payment_session_id) {
        console.error('❌ No payment_session_id received:', data);
        setError(true);
        return; // Early return - NO checkout
      }

      if (typeof data.payment_session_id !== 'string' || data.payment_session_id.trim().length === 0) {
        console.error('❌ Invalid payment_session_id format:', data.payment_session_id);
        setError(true);
        return; // Early return - NO checkout
      }

      console.log('✅ Payment session validated:', data.payment_session_id);

      // Step 3: Check Cashfree SDK availability
      if (!window.Cashfree) {
        console.error('❌ Cashfree SDK not available');
        setError(true);
        return; // Early return - NO checkout
      }

      // Step 4: Initialize Cashfree and checkout
      console.log('🚀 Opening Cashfree checkout...');
      const cashfree = new window.Cashfree({
        mode: "production"
      });

      // Wrap checkout in try-catch
      try {
        console.log('🚀 Forcing UPI payment methods');
        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: "_self",
          paymentMethods: ["upi"]
        });
        console.log('✅ Checkout initiated successfully');
      } catch (checkoutError) {
        console.error('❌ Cashfree checkout error:', checkoutError);
        setError(true);
        return; // Early return - NO redirect
      }

    } catch (error) {
      console.error('❌ Payment initialization failed:', error);
      setError(true);
      // No alert, no redirect - just set error state
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          fontSize: '14px',
          border: '1px solid #ffcdd2'
        }}>
          ❌ Payment failed. Please try again later.
        </div>
      )}
      
      <button
        onClick={handlePayment}
        disabled={isProcessing || !isCashfreeLoaded}
        style={{
          backgroundColor: error ? '#f44336' : (isProcessing ? '#9e9e9e' : '#4CAF50'),
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: (isProcessing || !isCashfreeLoaded) ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
      >
        {isProcessing ? (
          <>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid #ffffff', 
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Processing...
          </>
        ) : !isCashfreeLoaded ? (
          <>Loading...</>
        ) : error ? (
          <>Retry Payment – ₹149</>
        ) : (
          <>UPGRADE NOW – ₹149</>
        )}
      </button>
    </div>
  );
}
