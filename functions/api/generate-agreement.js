const functions = require("firebase-functions");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.generateAgreement = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.ownerName || !formData.tenantName || !formData.address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create the prompt for OpenAI
    const prompt = `Generate a professional rent agreement based on the following details:

PARTIES:
- Owner: ${formData.ownerName} (${formData.ownerContact || "No contact provided"})
- Tenant: ${formData.tenantName} (${formData.tenantContact || "No contact provided"})

PROPERTY:
- Address: ${formData.address}, ${formData.city || "City"}, ${formData.state || "State"}

TERMS:
- Monthly Rent: ₹${formData.rent || "Not specified"}
- Security Deposit: ₹${formData.deposit || "Not specified"}
- Start Date: ${formData.startDate || "Not specified"}
- Duration: ${formData.duration || "Not specified"} months
- Notice Period: ${formData.noticePeriod || "Not specified"} days

CUSTOM CLAUSES:
${formData.customClauses || "None specified"}

Please generate a comprehensive, legally-compliant rent agreement that:
1. Uses proper legal language and formatting
2. Includes all standard rent agreement clauses (rent payment, maintenance, termination, etc.)
3. Incorporates the specific details provided above
4. Follows Indian rental laws and practices
5. Is properly formatted with clear sections and numbering
6. Includes space for signatures at the end

Format the agreement with clear headings, numbered clauses, and professional legal language suitable for a real rental agreement in India.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal expert specializing in Indian rental agreements. Generate professional, legally-compliant rent agreements that are practical and enforceable."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
    });

    const agreement = completion.choices[0].message.content;

    res.json({
      success: true,
      agreement: agreement
    });

  } catch (error) {
    console.error("Error generating agreement:", error);
    
    // Fallback agreement if OpenAI fails
    const fallbackAgreement = generateFallbackAgreement(formData);
    
    res.json({
      success: true,
      agreement: fallbackAgreement
    });
  }
});

function generateFallbackAgreement(data) {
  return `RENT AGREEMENT

This Rent Agreement is made on ${data.startDate || "____"} between ${data.ownerName || "____"} (Owner) and ${data.tenantName || "____"} (Tenant).

PROPERTY DETAILS:
Address: ${data.address || "____"}, ${data.city || "____"}, ${data.state || "____"}

TERMS AND CONDITIONS:
1. Monthly Rent: ₹${data.rent || "____"} to be paid before the 5th of each month.
2. Security Deposit: ₹${data.deposit || "____"} refundable after agreement termination.
3. Duration: ${data.duration || "____"} months from the start date.
4. Notice Period: ${data.noticePeriod || "____"} days required for termination.
5. Maintenance: Tenant responsible for minor maintenance, Owner for major repairs.
6. Utilities: To be paid by the Tenant unless otherwise agreed.

CUSTOM CLAUSES:
${data.customClauses || "None specified"}

This agreement is governed by the laws of ${data.state || "India"}.

SIGNATURES:
Owner: _____________________    Date: ___________
Tenant: _____________________    Date: ___________
Witness: _____________________    Date: ___________`;
}
