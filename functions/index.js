const functions = require("firebase-functions");
const https = require("https");
const cors = require("cors")({ origin: true });

exports.createOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    console.log("=== CREATE ORDER START ===");
    console.log("Request method:", req.method);
    console.log("Request body:", JSON.stringify(req.body));

    // Validate request method
    if (req.method !== "POST") {
      console.log("❌ INVALID METHOD:", req.method);
      return res.status(405).json({
        error: "Method not allowed",
        message: "Only POST requests are accepted"
      });
    }

    try {
      // Credential loading from environment variables
      const APP_ID = process.env.CASHFREE_APP_ID;
      const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

      console.log("APP_ID exists:", !!APP_ID);
      console.log("APP_ID source:", "environment variable");
      console.log("SECRET_KEY exists:", !!SECRET_KEY);
      console.log("SECRET_KEY source:", "environment variable");

      if (!APP_ID || !SECRET_KEY) {
        console.log("❌ CREDENTIALS MISSING");
        return res.status(500).json({
          error: "Cashfree credentials not configured",
          message: "Unable to load Cashfree credentials from config or fallback"
        });
      }

      console.log("✅ CREDENTIALS LOADED");

      // Validate and extract request body
      const { amount, customerEmail, customerPhone, customerId } = req.body || {};
      const orderAmount = amount && !isNaN(amount) ? parseFloat(amount) : 149;
      const customerEmailValue = customerEmail || "test@test.com";
      const customerPhoneValue = customerPhone || "9999999999";
      const customerIdValue = customerId || `user_${Date.now()}`;

      console.log("Order amount:", orderAmount);
      console.log("Customer email:", customerEmailValue);
      console.log("Customer phone:", customerPhoneValue);
      console.log("Customer ID:", customerIdValue);

      // Generate order payload
      const orderId = `order_${Date.now()}`;
      const orderPayload = {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerIdValue,
          customer_email: customerEmailValue,
          customer_phone: customerPhoneValue
        },
        order_meta: {
          return_url: "https://rental-shield-a4638.web.app/payment-success",
          order_tags: {
            type: "SaaS"
          },
          // Force UPI visibility
          payment_methods: ["upi"]
        }
      };

      console.log("Order payload:", JSON.stringify(orderPayload, null, 2));

      // Call Cashfree API
      console.log("Calling Cashfree API...");

      const postData = JSON.stringify(orderPayload);
      
      const options = {
        hostname: 'api.cashfree.com',
        port: 443,
        path: '/pg/orders',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'x-client-id': APP_ID,
          'x-client-secret': SECRET_KEY,
          'x-api-version': '2023-08-01'
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              statusText: res.statusMessage,
              json: () => Promise.resolve(JSON.parse(data))
            });
          });
        });

        req.on('error', (error) => {
          reject(error);
        });

        req.write(postData);
        req.end();
      });

      console.log("Response received");
      console.log("Cashfree API response status:", response.status);
      console.log("Cashfree API response status text:", response.statusText);

      const data = await response.json();

      console.log("=== CASHFREE RESPONSE START ===");
      console.log(JSON.stringify(data, null, 2));
      console.log("=== CASHFREE RESPONSE END ===");

      // Check for payment_session_id
      if (!data.payment_session_id) {
        console.log("❌ NO payment_session_id IN RESPONSE");
        const errorMessage = data.message || data.error || "Unknown error from Cashfree";
        return res.status(500).json({
          error: "Payment session not created",
          message: errorMessage,
          details: data
        });
      }

      console.log("✅ payment_session_id RECEIVED:", data.payment_session_id);

      // Return clean response
      return res.status(200).json({
        payment_session_id: data.payment_session_id,
        order_id: orderId,
        order_amount: orderAmount
      });

    } catch (error) {
      console.error("🔥 REAL ERROR:", error);

      return res.status(500).json({
        error: error.message,
        stack: error.stack
      });
    }
  });
});

exports.analyzeAgreement = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    try {
      return res.json({
        score: 70,
        risk: "Medium",
        issues: [
          {
            title: "Missing Security Deposit Clause",
            problem: "No deposit terms mentioned",
            impact: "Disputes during move-out",
            suggestion: "Add refundable deposit clause",
            example_clause: "Tenant shall pay a refundable security deposit of INR 50,000..."
          },
          {
            title: "Missing Termination Clause",
            problem: "No exit policy defined",
            impact: "Legal disputes",
            suggestion: "Add notice period clause",
            example_clause: "Either party must give 30 days notice before termination..."
          }
        ]
      });
    } catch (e) {
      res.status(500).send("Error");
    }
  });
});
