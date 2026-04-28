const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");

exports.createOrder = onRequest(async (req, res) => {
  try {
    const { amount, customerEmail } = req.body;

    if (!amount || !customerEmail) {
      return res.status(400).json({
        error: "Missing amount or customerEmail",
      });
    }

    const appId = functions.config().cashfree?.app_id;
    const secretKey = functions.config().cashfree?.secret_key;

    console.log("Cashfree App ID:", appId ? "Loaded" : "Missing");

    if (!appId || !secretKey) {
      return res.status(500).json({
        error: "Cashfree credentials not configured",
      });
    }

    const orderId = "order_" + Date.now();

    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "cust_" + Date.now(),
          customer_email: customerEmail,
          customer_phone: "9999999999",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": appId,
          "x-client-secret": secretKey,
        },
      }
    );

    return res.status(200).json({
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
    });
  } catch (error) {
    console.error("Cashfree Error:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Failed to create order",
      details: error.response?.data || error.message,
    });
  }
});

exports.generateDisputeContent = functions.https.onCall(async (data, context) => {
  try {
    // Initialize OpenAI inside the function, not at top level
    const { OpenAI } = require("openai");
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const {
      propertyAddress,
      leaseStartDate,
      leaseEndDate,
      monthlyRent,
      securityDeposit,
      ownerName,
      category,
      summary,
      details,
      issueStartDate,
      resolutionDays,
    } = data;

    // Enhanced prompt for conversational legal letter generation
    const prompt = `Generate a professional legal notice letter with the following details:

Property Details:
- Address: ${propertyAddress || '[Property Address]'}
- Lease Period: ${leaseStartDate || '[Start Date]'} to ${leaseEndDate || '[End Date]'}
- Monthly Rent: ₹${monthlyRent || '[Amount]'}
- Security Deposit: ₹${securityDeposit || '[Amount]'}
- Owner/Landlord: ${ownerName || '[Owner Name]'}

Issue Details:
- Category: ${category || '[Category]'}
- Summary: ${summary || '[Summary]'}
- Details: ${details || '[Details]'}
- Issue Start Date: ${issueStartDate || '[Issue Start Date]'}
- Resolution Required Within: ${resolutionDays || '7'} days

Requirements:
1. Write in a formal, professional, conversational style (no bullet points)
2. Include all relevant details naturally in the letter
3. Structure as a proper legal notice with date, recipient, subject, body, and signature
4. Be firm but professional in tone
5. Include legal references to Rent Control Act if applicable
6. End with a clear call to action and timeline
7. Format for proper legal correspondence

Generate the complete letter below:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a legal assistant specializing in drafting professional legal notices for landlord-tenant disputes. Always write in a formal, conversational style without bullet points."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const generatedLetter = completion.choices[0].message.content;

    return {
      success: true,
      generatedLetter: generatedLetter,
      message: "Legal notice generated successfully"
    };

  } catch (error) {
    console.error("Error generating dispute content:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// New function for server-side PDF generation
exports.generatePDF = functions.https.onCall(async (data, context) => {
  try {
    const { content } = data;

    // Create HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Legal Notice</title>
    <style>
        @page {
            margin: 0.5in;
            size: A4;
        }
        body { 
            font-family: 'Times New Roman', serif; 
            line-height: 1.6; 
            margin: 0;
            padding: 20px;
            font-size: 12pt;
            background: white;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            font-weight: bold;
            font-size: 16pt;
        }
        .date { 
            text-align: right; 
            margin-bottom: 20px;
            font-size: 12pt;
        }
        .recipient { 
            margin-bottom: 20px;
            font-size: 12pt;
        }
        .subject { 
            font-weight: bold; 
            margin-bottom: 20px;
            font-size: 12pt;
        }
        .content { 
            margin-bottom: 30px;
            text-align: justify;
            font-size: 12pt;
        }
        .signature { 
            margin-top: 50px;
            text-align: right;
            font-size: 12pt;
        }
    </style>
</head>
<body>
    <div class="header">
        LEGAL NOTICE
    </div>
    
    <div class="date">
        Date: ${new Date().toLocaleDateString('en-IN')}
    </div>
    
    <div class="recipient">
        To,<br>
        ${data.ownerName || '[Owner Name]'}<br>
        ${data.propertyAddress || '[Property Address]'}
    </div>
    
    <div class="subject">
        Subject: Legal Notice regarding ${data.category || 'Dispute Issue'}
    </div>
    
    <div class="content">
        ${content || 'Content to be generated'}
    </div>
    
    <div class="signature">
        Sincerely,<br>
        [Your Name]<br>
        [Your Contact Details]
    </div>
</body>
</html>`;

    return {
      success: true,
      htmlContent: htmlContent,
      message: "PDF HTML content generated successfully"
    };

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Simple test function to verify deployment
exports.testFunction = functions.https.onCall(async (data, context) => {
  return {
    success: true,
    message: "Functions are working correctly!",
    timestamp: new Date().toISOString()
  };
});