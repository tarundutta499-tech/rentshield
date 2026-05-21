const functions = require("firebase-functions");
const https = require("https");
const cors = require("cors")({ origin: true });
const { OpenAI } = require("openai");


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
      res.status(500).json({
        success: false,
        error: "Internal Server Error"
      });
    }
  });
});

// Normalize agreement output to fix formatting issues
const normalizeAgreementOutput = (text = "") => {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/(\d+)\.\s+(\d+)\s+/g, "$1.$2 ")
    .replace(/([a-zA-Z0-9₹).])\s*\.(\d+)\s+/g, "$1\n$2.$2 ")
    .replace(/([^\n])\s+(TERM OF AGREEMENT|RENT AND SECURITY DEPOSIT|MAINTENANCE AND REPAIRS|UTILITIES|NOTICE PERIOD|USE OF PREMISES|INDEMNITY|GOVERNING LAW AND JURISDICTION|ARBITRATION|SIGNATURES:)/g, "$1\n\n$2")
    .replace(/([^\n])\s+(\d+\.\d+\s+)/g, "$1\n$2")
    .replace(/([^\n])\s+(\d+\.\s+[A-Z])/g, "$1\n\n$2")
    // Fix specific known issues
    .replace(/\s*\.2\s+Security Deposit/g, "\n3.2 Security Deposit")
    .replace(/\s*\.2\s+Major repairs/g, "\n4.2 Major repairs")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

exports.generateAgreement = functions.https.onRequest((req, res) => {
  // Set CORS headers for all responses
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  
  cors(req, res, async () => {
    try {
    const data = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: "No input data provided"
      });
    }

    // Extract fields safely
    const ownerName = data.ownerName || data.owner?.name || "";
    const tenantName = data.tenantName || data.tenant?.name || "";
    const propertyAddress = data.propertyAddress || data.property?.address || data.address || "";
    const city = data.city || data.property?.city || "";
    const state = data.state || data.property?.state || "";
    const rent = data.rent || "";
    const deposit = data.deposit || "";
    const startDate = data.startDate || "";
    const duration = data.duration || "";
    const noticePeriod = data.noticePeriod || "";
    const customClauses = data.customClauses || "";

    // Generate basic agreement template
    const agreementText = `
RENT AGREEMENT

THIS RENT AGREEMENT is made on ${startDate || new Date().toLocaleDateString()} at ${city || "City"}, ${state || "State"}

BETWEEN:

${ownerName || "OWNER NAME"}, adult, Indian inhabitant, residing at ${data.ownerAddress || "address not provided"}, Contact Number: ${data.ownerContact || "contact not provided"} (hereinafter referred to as the "Owner")

AND

${tenantName || "TENANT NAME"}, adult, Indian inhabitant, residing at ${data.tenantAddress || "address not provided"}, Contact Number: ${data.tenantContact || "contact not provided"} (hereinafter referred to as the "Tenant")

The Owner and Tenant are hereinafter collectively referred to as "Parties" and individually as a "Party".

WHEREAS:

1. The Owner is the absolute owner of the residential premises situated at ${propertyAddress}, ${city}, ${state} (hereinafter referred to as the "Premises").

2. The Tenant has requested the Owner to let out the Premises on rent and the Owner has agreed to let the same to the Tenant on the terms and conditions hereinafter contained.

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:

1. DEMISE OF PREMISES
The Owner hereby lets out to the Tenant and the Tenant hereby takes on rent the Premises situated at ${propertyAddress}, ${city}, ${state} for residential purposes only.

2. TERM OF AGREEMENT
This agreement shall be for a period of ${duration || "11"} months commencing from ${startDate || "Start Date"} and shall be renewable with mutual consent of both parties.

3. RENT AND SECURITY DEPOSIT
3.1 Monthly Rent: ₹${rent || "Rent Amount"} payable in advance on or before the 5th day of each calendar month.
3.2 Security Deposit: ₹${deposit || "Deposit Amount"} payable by the Tenant to the Owner which shall be refundable at the time of vacation of premises subject to deduction of damages, if any.

4. MAINTENANCE AND REPAIRS
4.1 The Tenant shall keep the Premises in good condition and shall not make any structural alterations without prior written consent of the Owner.
4.2 Major repairs shall be the responsibility of the Owner while minor maintenance shall be borne by the Tenant.

5. UTILITIES
All charges for electricity, water, gas, and other utilities shall be paid by the Tenant directly to the concerned authorities.

6. NOTICE PERIOD
Either party may terminate this agreement by giving ${noticePeriod || "30"} days written notice to the other party.

7. USE OF PREMISES
The Premises shall be used only for residential purposes and shall not be used for any commercial or illegal activities.

8. INDEMNITY
The Tenant shall indemnify and keep indemnified the Owner against all losses, damages, claims, demands, actions, costs, expenses, and proceedings whatsoever.

9. GOVERNING LAW AND JURISDICTION
This agreement shall be governed by the laws of ${state || "India"} and the courts at ${city || "City"} shall have exclusive jurisdiction.

10. ARBITRATION
Any disputes arising between parties shall be referred to arbitration under the Arbitration and Conciliation Act, 1996.

${customClauses ? `
11. CUSTOM CLAUSES
${customClauses}
` : ""}

IN WITNESS WHEREOF, Parties have set their respective hands on the day, month, and year first above written.

SIGNATURES:

_________________________
${ownerName || "Owner Name"}
Owner

_________________________
${tenantName || "Tenant Name"}
Tenant

_________________________
Witness 1

_________________________
Witness 2
    `;

    return res.json({
      success: true,
      agreement: agreementText
    });

  } catch (error) {
    console.error("❌ generateAgreement ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
  });
});

function generateFallbackAgreement(data) {
  // Extract fields with same logic as main function
  const ownerName = data.ownerName || data.owner?.name || "";
  const tenantName = data.tenantName || data.tenant?.name || "";
  const propertyAddress = data.propertyAddress || data.property?.address || data.address || "";
  const ownerAddress = data.ownerAddress || data.owner?.address || "";
  const tenantAddress = data.tenantAddress || data.tenant?.address || "";
  const ownerContact = data.ownerContact || data.owner?.contact || data.owner?.phone || "";
  const tenantContact = data.tenantContact || data.tenant?.contact || data.tenant?.phone || "";
  const city = data.city || data.property?.city || "";
  const state = data.state || data.property?.state || "";
  const rent = data.rent || "";
  const deposit = data.deposit || "";
  const startDate = data.startDate || "";
  const duration = data.duration || "";
  const noticePeriod = data.noticePeriod || "";

  return `RENT AGREEMENT

THIS RENT AGREEMENT is made on ${startDate || new Date().toLocaleDateString()} at ${city || "City"}, ${state || "State"}

BETWEEN:

${ownerName || "OWNER NAME"}, adult, Indian inhabitant, residing at ${ownerAddress || "address not provided"}, Contact Number: ${ownerContact} (hereinafter referred to as the "Owner")

AND

${tenantName || "TENANT NAME"}, adult, Indian inhabitant, residing at ${tenantAddress || "address not provided"}, Contact Number: ${tenantContact} (hereinafter referred to as the "Tenant")

The Owner and Tenant are hereinafter collectively referred to as "Parties" and individually as a "Party".

WHEREAS:

1. The Owner is the absolute owner of the residential premises situated at ${propertyAddress}, ${city}, ${state} (hereinafter referred to as the "Premises").

2. The Tenant has requested the Owner to let out the Premises on rent and the Owner has agreed to let the same to the Tenant on the terms and conditions hereinafter contained.

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:

1. DEMISE OF PREMISES
The Owner hereby lets out to the Tenant and the Tenant hereby takes on rent the Premises situated at ${propertyAddress}, ${city}, ${state} for residential purposes only.

2. TERM OF AGREEMENT
This agreement shall be for a period of ${duration || "11"} months commencing from ${startDate || "Start Date"} and shall be renewable with mutual consent of both parties.

3. RENT AND SECURITY DEPOSIT
3.1 Monthly Rent: ₹${rent || "Rent Amount"} payable in advance on or before the 5th day of each calendar month.
3.2 Security Deposit: ₹${deposit || "Deposit Amount"} payable by the Tenant to the Owner which shall be refundable at the time of vacation of premises subject to deduction of damages, if any.

4. MAINTENANCE AND REPAIRS
4.1 The Tenant shall keep the Premises in good condition and shall not make any structural alterations without prior written consent of the Owner.
4.2 Major repairs shall be the responsibility of the Owner while minor maintenance shall be borne by the Tenant.

5. UTILITIES
All charges for electricity, water, gas, and other utilities shall be paid by the Tenant directly to the concerned authorities.

6. NOTICE PERIOD
Either party may terminate this agreement by giving ${noticePeriod || "30"} days written notice to the other party.

7. USE OF PREMISES
The Premises shall be used only for residential purposes and shall not be used for any commercial or illegal activities.

8. INDEMNITY
The Tenant shall indemnify and keep indemnified the Owner against all losses, damages, claims, demands, actions, costs, expenses, and proceedings whatsoever.

9. GOVERNING LAW AND JURISDICTION
This agreement shall be governed by the laws of ${state || "India"} and the courts at ${city || "City"} shall have exclusive jurisdiction.

10. ARBITRATION
Any disputes arising between the parties shall be referred to arbitration under the Arbitration and Conciliation Act, 1996.

${customClauses ? `
11. CUSTOM CLAUSES
${customClauses}
` : ""}

IN WITNESS WHEREOF the Parties have set their respective hands on the day, month, and year first above written.

SIGNATURES:

_________________________
${ownerName || "Owner Name"}
Owner

_________________________
${tenantName || "Tenant Name"}
Tenant

_________________________
Witness 1

_________________________
Witness 2

`;
}

// Cashfree Payment Gateway Integration
const axios = require("axios");

exports.createCashfreeOrder = functions
  .runWith({
    secrets: ["CASHFREE_APP_ID", "CASHFREE_SECRET_KEY", "CASHFREE_MODE"]
  })
  .https.onRequest((req, res) => {
  // Set CORS headers for all responses
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  
  cors(req, res, async () => {
    try {
      console.log("Incoming payment request:", req.body);
      
      // Get Cashfree config from environment variables
      const appId = process.env.CASHFREE_APP_ID;
      const secretKey = process.env.CASHFREE_SECRET_KEY;
      const mode = process.env.CASHFREE_MODE || "sandbox";
      
      // Debug logs (without revealing actual values)
      console.log("Cashfree mode:", mode);
      console.log("App ID present:", !!appId);
      console.log("Secret present:", !!secretKey);
      
      if (!appId || !secretKey) {
        throw new Error("Cashfree configuration missing. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY environment variables.");
      }
      
      // Determine API URL based on mode
      const apiUrl = mode === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";
      
      console.log("Using API URL:", apiUrl);
      
      // Extract customer details from request body
      const { amount = 199, customer_email, customer_phone, customer_name } = req.body;
      
      // Validate required fields
      if (!amount || !customer_phone) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: amount, customer_phone"
        });
      }
      
      // Clean phone number - ensure 10 digits without +91
      const cleanPhone = customer_phone.toString().replace(/\D/g, '').slice(-10);
      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          error: "Invalid phone number. Must be 10 digits"
        });
      }
      
      const orderId = "ORDER_" + Date.now();
      const customerId = "CUST_" + Date.now();

      const orderPayload = {
        order_id: orderId,
        order_amount: Number(amount), // Ensure it's a number, not string
        order_currency: "INR",
        customer_details: {
          customer_id: customerId,
          customer_email: customer_email || "customer@example.com",
          customer_phone: cleanPhone,
          customer_name: customer_name || "Customer"
        },
        order_meta: {
          return_url: `https://rentshieldindia.com/payment-success?order_id=${orderId}`
        }
      };

      console.log("Order payload:", JSON.stringify(orderPayload, null, 2));

      const response = await axios.post(apiUrl, orderPayload, {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2023-08-01", // Updated API version
          "x-client-id": appId,
          "x-client-secret": secretKey
        }
      });

      console.log("Cashfree response:", response.data);

      // Return success response with required fields
      res.json({
        success: true,
        order_id: orderId,
        payment_session_id: response.data.payment_session_id,
        order_data: response.data
      });
      
    } catch (error) {
      console.error("❌ createCashfreeOrder ERROR:", error.message);
      console.error("Cashfree error:", error.response?.data || error.message);
      console.error("Full error:", error);
      
      // Return more detailed error information
      res.status(500).json({
        success: false,
        error: error.response?.data?.message || error.message || "Order creation failed",
        details: error.response?.data || null
      });
    }
  });
});
