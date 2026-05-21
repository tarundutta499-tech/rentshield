import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthProvider.jsx';
import { auth, db } from '../lib/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import { jsPDF } from "jspdf";
// pdf-lib will be imported dynamically in merge function

// Cashfree Script Loader
const loadCashfree = () => {
  return new Promise((resolve) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;

    script.onload = () => {
      resolve(window.Cashfree);
    };

    document.body.appendChild(script);
  });
};

export default function AgreementGeneratorPage() {
  console.log(" AgreementGeneratorPage component mounted");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPreview, setShowPreview] = useState(false);
  const [generatedAgreement, setGeneratedAgreement] = useState("");
  const [compliance, setCompliance] = useState({
    score: 100,
    risks: []
  });
  const [isPaid, setIsPaid] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    // Property
    propertyAddress: "",
    city: "",
    state: "",

    // Owner
    ownerName: "",
    ownerContact: "",
    ownerAddress: "",

    // Tenant
    tenantName: "",
    tenantContact: "",
    tenantAddress: "",

    // Terms
    rent: "",
    deposit: "",
    startDate: "",
    duration: "",
    noticePeriod: "",

    // Optional
    customClauses: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Automatically sanitize phone number fields
    if (name === 'ownerContact' || name === 'tenantContact') {
      const sanitized = sanitizePhone(value);
      setFormData({
        ...formData,
        [name]: sanitized
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const cleanText = (text) => {
    if (!text) return "";

    return text
      .replace(/&[a-z]+;/gi, " ")
      .replace(/&/g, "")
      .replace(/\u00A0/g, " ")
      .trim(); 
  };

  const sanitizePhone = (phone) => {
    return String(phone || "")
      .replace(/\D/g, "")
      .trim();
  };

  const isValidIndianPhone = (phone) => {
    const cleaned = sanitizePhone(phone);

    // Handle +91 prefix
    const normalized =
      cleaned.startsWith("91") && cleaned.length === 12
        ? cleaned.slice(2)
        : cleaned;

    return normalized.length === 10;
  };

  const isValidPhone = (phone) => {
    return isValidIndianPhone(phone);
  };

  
  const runChecks = (data) => {
    const risks = [];

    if (!data.ownerName) risks.push("Owner name missing");
    if (!data.tenantName) risks.push("Tenant name missing");
    if (!data.propertyAddress) risks.push("Property address missing");
    if (!data.ownerAddress) risks.push("Owner address missing");
    if (!data.tenantAddress) risks.push("Tenant address missing");
    if (!data.rent) risks.push("Rent amount not specified");
    if (!data.deposit) risks.push("Security deposit missing");
    if (!data.duration) risks.push("Agreement duration missing");
    if (!data.noticePeriod) risks.push("No notice period defined");
    if (!data.state) risks.push("State not selected (legal risk)");

    const score = Math.max(60, 100 - risks.length * 10);
    setCompliance({ score, risks });
  };

  // Normalize agreement text for proper formatting
  const normalizeAgreementText = (text) => {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/([^\n])\s+(\d{1,2}[\).]\s+)/g, "$1\n\n$2") // Add spacing before numbered clauses
      .replace(/([^\n])\s+([•\-*]\s+)/g, "$1\n$2") // Add spacing before bullets
      .replace(/([^\n])\s+([a-zA-Z])\s+/g, "$1\n$2") // Add spacing before lettered bullets
      .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
      .trim();
  };

  // Remove duplicate clause fragments and broken content
  const removeDuplicateClauseFragments = (text) => {
    const blocks = String(text || "")
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean);

    const cleaned = [];

    for (const block of blocks) {
      // Remove standalone number-only duplicate blocks: "3", "4", "5", "10", "3.", "4."
      if (/^\d{1,2}\.$/.test(block)) {
        continue;
      }

      // Remove duplicate lowercase heading fragments like "5. utilities shall..."
      // when the proper uppercase section heading already exists.
      if (/^5\.\s+utilities\s+/i.test(block)) {
        continue;
      }

      // Remove broken duplicate arbitration fragments produced by bad wrapping.
      if (/^10\.\s+arbitration under the/i.test(block)) {
        continue;
      }

      if (/^10\.\s+Arbitration and Conciliation Act,?$/i.test(block)) {
        continue;
      }

      // Remove dangling year fragment left by arbitration duplicate.
      if (/^1996\.?$/.test(block)) {
        continue;
      }

      cleaned.push(block);
    }

    return cleaned.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
};

// Ensure all required agreement sections exist in proper order
const ensureRequiredAgreementSections = (text, formData) => {
  let output = String(text || "");

  const requiredSections = [
    {
      number: 1,
      title: "DEMISE OF PREMISES",
      fallback: `1. DEMISE OF PREMISES\nThe Owner hereby lets out to the Tenant and the Tenant hereby takes on rent the premises situated at ${formData.propertyAddress}, ${formData.city}, ${formData.state} for residential purposes only.` 
    },
    {
      number: 2,
      title: "TERM OF AGREEMENT",
      fallback: `2. TERM OF AGREEMENT\nThis agreement shall be for a period of ${formData.duration} months commencing from ${formData.startDate} and shall be renewable with mutual consent of both parties.` 
    },
    {
      number: 3,
      title: "RENT AND SECURITY DEPOSIT",
      fallback: `3. RENT AND SECURITY DEPOSIT\n3.1 Monthly Rent: ₹${formData.rent} payable in advance on or before the 5th day of each calendar month.\n3.2 Security Deposit: ₹${formData.deposit} payable by the Tenant to the Owner, refundable at the time of vacation of the premises subject to deduction of damages, if any.` 
    },
    {
      number: 4,
      title: "MAINTENANCE AND REPAIRS",
      fallback: `4. MAINTENANCE AND REPAIRS\n4.1 The Tenant shall keep the Premises in good condition and shall not make any structural alterations without prior written consent of the Owner.\n4.2 Major repairs shall be the responsibility of the Owner while minor maintenance shall be borne by the Tenant.` 
    },
    {
      number: 5,
      title: "UTILITIES",
      fallback: `5. UTILITIES\nAll charges for electricity, water, gas, internet, maintenance, and other utilities shall be paid by the Tenant directly to the concerned authorities unless otherwise agreed in writing.` 
    },
    {
      number: 6,
      title: "NOTICE PERIOD",
      fallback: `6. NOTICE PERIOD\nEither party may terminate this agreement by giving ${formData.noticePeriod} days written notice to the other party.` 
    },
    {
      number: 7,
      title: "USE OF PREMISES",
      fallback: `7. USE OF PREMISES\nThe Premises shall be used only for residential purposes and shall not be used for any commercial or illegal activities.` 
    },
    {
      number: 8,
      title: "INDEMNITY",
      fallback: `8. INDEMNITY\nThe Tenant shall indemnify and keep indemnified the Owner against all losses, damages, claims, demands, actions, costs, expenses, and proceedings whatsoever.` 
    },
    {
      number: 9,
      title: "GOVERNING LAW AND JURISDICTION",
      fallback: `9. GOVERNING LAW AND JURISDICTION\nThis agreement shall be governed by the laws of ${formData.state} and the courts at ${formData.city} shall have exclusive jurisdiction.` 
    },
    {
      number: 10,
      title: "ARBITRATION",
      fallback: `10. ARBITRATION\nAny disputes arising between the parties shall be referred to arbitration under the Arbitration and Conciliation Act, 1996.` 
    }
  ];

  for (let i = 0; i < requiredSections.length; i++) {
    const section = requiredSections[i];
    const currentRegex = new RegExp(`\\n?${section.number}\\.\\s+${section.title}`, "i");

    if (!currentRegex.test(output)) {
      const nextSection = requiredSections
        .slice(i + 1)
        .find((next) =>
          new RegExp(`\\n?${next.number}\\.\\s+${next.title}`, "i").test(output)
        );

      if (nextSection) {
        const nextRegex = new RegExp(`\\n?${nextSection.number}\\.\\s+${nextSection.title}`, "i");
        output = output.replace(nextRegex, `\n\n${section.fallback}\n\n${nextSection.number}. ${nextSection.title}`);
      } else {
        output = `${output.trim()}\n\n${section.fallback}`;
      }
    }
  }

  return output.replace(/\n{3,}/g, "\n\n").trim();
};

// Format agreement content to fix malformed text and ensure consistency
const formatAgreementContent = (rawText, formData) => {
  let text = String(rawText || "");

  // Normalize line endings and spaces
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

  // Fix known malformed subclauses
  text = text
    .replace(/\s*\.2\s+Security Deposit/gi, "\n3.2 Security Deposit")
    .replace(/\s*\.2\s+Major repairs/gi, "\n4.2 Major repairs")
    .replace(/3\.\s*1\s+/g, "3.1 ")
    .replace(/4\.\s*1\s+/g, "4.1 ");

  // Add line breaks before major headings
  text = text
    .replace(/\s+(WHEREAS:)/gi, "\n\n$1")
    .replace(/\s+(NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:)/gi, "\n\n$1")
    .replace(/\s+(DEMISE OF PREMISES)/gi, "\n\n1. $1")
    .replace(/\s+(TERM OF AGREEMENT)/gi, "\n\n2. $1")
    .replace(/\s+(RENT AND SECURITY DEPOSIT)/gi, "\n\n3. $1")
    .replace(/\s+(MAINTENANCE AND REPAIRS)/gi, "\n\n4. $1")
    .replace(/\s+(UTILITIES)/gi, "\n\n5. $1")
    .replace(/\s+(NOTICE PERIOD)/gi, "\n\n6. $1")
    .replace(/\s+(USE OF PREMISES)/gi, "\n\n7. $1")
    .replace(/\s+(INDEMNITY)/gi, "\n\n8. $1")
    .replace(/\s+(GOVERNING LAW AND JURISDICTION)/gi, "\n\n9. $1")
    .replace(/\s+(ARBITRATION)/gi, "\n\n10. $1")
    .replace(/\s+(SIGNATURES:)/gi, "\n\n$1");

  // Add line breaks before numbered clauses/subclauses
  text = text
    .replace(/([^\n])\s+(\d+\.\s+[A-Z])/g, "$1\n\n$2")
    .replace(/([^\n])\s+(\d+\.\d+\s+)/g, "$1\n$2");

  // Force correct BETWEEN section using form data, so phone numbers are not used as addresses
  const betweenSection = `BETWEEN:

${formData.ownerName}, adult, Indian inhabitant, residing at ${formData.ownerAddress}, Contact Number: ${formData.ownerContact} (hereinafter referred to as the "Owner")

AND

${formData.tenantName}, adult, Indian inhabitant, residing at ${formData.tenantAddress}, Contact Number: ${formData.tenantContact} (hereinafter referred to as the "Tenant")

The Owner and Tenant are hereinafter collectively referred to as "Parties" and individually as a "Party".`;

  // Replace existing BETWEEN section up to WHEREAS
  if (/BETWEEN:[\s\S]*?WHEREAS:/i.test(text)) {
    text = text.replace(/BETWEEN:[\s\S]*?WHEREAS:/i, `${betweenSection}\n\nWHEREAS:`);
  }

  text = removeDuplicateClauseFragments(text);
  text = ensureRequiredAgreementSections(text, formData);

  // Fix corrupted section 3 only
  const rentSection = `3. RENT AND SECURITY DEPOSIT

3.1 Monthly Rent: Rs. ${formData.rent} shall be payable by the Tenant in advance on or before the 5th day of each calendar month.

3.2 Security Deposit: Rs. ${formData.deposit} shall be payable by the Tenant to the Owner and shall be refundable at the time of vacation of the premises, subject to deduction of damages, unpaid dues, or other lawful deductions, if any.`;

  text = text.replace(
    /3\.\s+RENT AND SECURITY DEPOSIT[\s\S]*?(?=\n\s*4\.\s+MAINTENANCE AND REPAIRS)/i,
    rentSection + "\n\n"
  );

  text = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => !/^\d{1,2}\.?$/.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
};

// Clean agreement text to remove special characters and bad formatting
const cleanAgreementText = (text) => {
  const normalized = normalizeAgreementText(text);
  return normalized
    .replace(/\uFFFD/g, "") // Remove replacement character
    .replace(/[]/g, "") // Remove bad encoding chars
    .replace(/[^\S\r\n]+/g, " ") // Fix whitespace
    .replace(/\s+([,.;:])/g, "$1") // Fix spacing before punctuation
    .replace(/([A-Za-z])\s+([0-9]{6,})\s+([A-Za-z])/g, "$1 $3") // Remove random long numbers between text
    .replace(/\d{10,}/g, (match) => {
      // Check if it looks like a phone number in the middle of text
      if (/[A-Za-z]/.test(match.slice(-1))) {
        return match.slice(0, -1); // Remove trailing letters
      }
      return match;
    })
    .replace(/([.!?])\s*\d+\s*([.!?])/g, "$1$2") // Remove numbers between sentences
    .trim();
};

const generateAgreement = async () => {
  console.log("=== GENERATING AGREEMENT ===");
  
  // Debug logs to track address vs contact values
  console.log("Owner Address:", formData.ownerAddress);
  console.log("Owner Contact:", formData.ownerContact);
  console.log("Tenant Address:", formData.tenantAddress);
  console.log("Tenant Contact:", formData.tenantContact);
  console.log("Property Address:", formData.propertyAddress);

  // Enhanced validation - addresses must not look like phone numbers
  const isPhoneLike = (text) => /^[0-9\s\-\(\)]{8,}$/.test(text.trim());
  
  if (isPhoneLike(formData.ownerAddress)) {
    alert("Owner Address cannot be a phone number. Please enter a proper address.");
    return;
  }

  if (isPhoneLike(formData.tenantAddress)) {
    alert("Tenant Address cannot be a phone number. Please enter a proper address.");
    return;
  }

  if (isPhoneLike(formData.propertyAddress)) {
    alert("Property Address cannot be a phone number. Please enter a proper address.");
    return;
  }

  // Validate contacts are actually phone numbers using new helper function
  if (formData.ownerContact && !isValidPhone(formData.ownerContact)) {
    alert("Owner Contact must be a valid 10-digit phone number.");
    return;
  }

  if (formData.tenantContact && !isValidPhone(formData.tenantContact)) {
    alert("Tenant Contact must be a valid 10-digit phone number.");
    return;
  }
  
  // Frontend validation for required fields
  const requiredFields = [
    ["ownerName", formData.ownerName],
    ["tenantName", formData.tenantName],
    ["address", formData.propertyAddress]
  ];

  const missingFields = requiredFields
    .filter(([, value]) => !String(value || "").trim())
    .map(([field]) => field);

  if (missingFields.length) {
    alert(`Missing required fields: ${missingFields.join(", ")}`);
    return;
  }

  const payload = {
    ownerName: formData.ownerName,
    tenantName: formData.tenantName,

    address: formData.propertyAddress,
    propertyAddress: formData.propertyAddress,
    city: formData.city,
    state: formData.state,

    ownerAddress: formData.ownerAddress,
    tenantAddress: formData.tenantAddress,
    ownerContact: formData.ownerContact,
    tenantContact: formData.tenantContact,

    rent: formData.rent,
    deposit: formData.deposit,
    startDate: formData.startDate,
    duration: formData.duration,
    noticePeriod: formData.noticePeriod,
    customClauses: formData.customClauses,

    owner: {
      name: formData.ownerName,
      address: formData.ownerAddress,
      contact: formData.ownerContact,
      phone: formData.ownerContact
    },

    tenant: {
      name: formData.tenantName,
      address: formData.tenantAddress,
      contact: formData.tenantContact,
      phone: formData.tenantContact
    },

    property: {
      address: formData.propertyAddress,
      city: formData.city,
      state: formData.state
    }
  };
  
  console.log("FINAL PAYLOAD:", payload);
  console.log("Backend required fields:");
  console.log("- ownerName:", payload.ownerName);
  console.log("- tenantName:", payload.tenantName);
  console.log("- address (property):", payload.address);
  console.log("Structured fields:");
  console.log("- Owner Address:", payload.owner.address);
  console.log("- Owner Contact:", payload.owner.phone);
  console.log("- Tenant Address:", payload.tenant.address);
  console.log("- Tenant Contact:", payload.tenant.phone);
  console.log("- Property Address:", payload.property.address);
  
  try {
    console.log("Sending data:", payload);
    
    const response = await fetch("https://rentshieldindia.com/api/generateAgreement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API ERROR:", errorText);
      throw new Error(`Server error: ${errorText}`);
    }

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON:", text);
      throw new Error("Server returned invalid response: " + text);
    }

    console.log("API RESPONSE:", data);

    const rawAgreement = data.agreement || data.text || "";
    const formattedAgreement = formatAgreementContent(rawAgreement, formData);
    console.log("Formatted agreement length:", formattedAgreement.length);
    setGeneratedAgreement(formattedAgreement);
    runChecks(formData);
    setShowPreview(true);

  } catch (err) {
    console.error("API Error:", err);
    alert("Error generating agreement: " + (err.message || "Unknown error occurred. Please check console for details."));
    console.error("Full error details:", {
      message: err.message,
      stack: err.stack,
      response: err.response ? await err.response.text() : 'No response'
    });
  }
};





  // Helper function to add wrapped text to PDF
  const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 5) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line, index) => {
      doc.text(line, x, y + (index * lineHeight));
    });
    return lines.length * lineHeight;
  };

  // Helper function to add section heading
  const addSectionHeading = (doc, heading, x, y) => {
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text(heading.toUpperCase(), x, y);
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    return 8; // Space after heading
  };

  // Helper function to add signature blocks
  const addSignatureBlocks = (doc, y) => {
    doc.setFont("times", "normal");
    doc.setFontSize(10);
    
    // Left side - Owner/Landlord
    doc.text("_________________________", 20, y);
    doc.text("OWNER / LANDLORD", 20, y + 5);
    
    // Right side - Tenant
    doc.text("_________________________", 110, y);
    doc.text("TENANT", 110, y + 5);
    
    // Witnesses below
    const witnessY = y + 20;
    
    doc.text("_________________________", 20, witnessY);
    doc.text("WITNESS 1", 20, witnessY + 5);
    
    doc.text("_________________________", 110, witnessY);
    doc.text("WITNESS 2", 110, witnessY + 5);
    
    return witnessY + 15; // Return new Y position
  };

  // Helper function to add watermark
  const addWatermark = (doc, text) => {
    try {
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.setFont("times", "normal");
      doc.setFontSize(40);

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(text, 105, 150, { angle: 45, align: "center" });
      }

      doc.restoreGraphicsState();
    } catch (e) {
      console.warn("Watermark skipped:", e);
      try {
        doc.restoreGraphicsState();
      } catch (_) {
        /* ignore */
      }
    }
  };

  // Main PDF generation function (sync load of jsPDF so doc.save keeps user activation after click)
  const generatePDF = (isWatermarked = false) => {
    console.log("=== STARTING PDF GENERATION ===");
    console.log("Is watermarked:", isWatermarked);
    console.log("Is paid:", isPaid);
    console.log("Generated agreement exists:", !!generatedAgreement);
    
    if (!generatedAgreement) {
      console.error("ERROR: No agreement generated");
      alert("Generate agreement first");
      return;
    }

    if (!isWatermarked && !isPaid) {
      console.error("ERROR: Payment required for clean PDF");
      alert("Please complete payment to download clean agreement");
      return;
    }

    try {
      console.log("Step 1: Creating jsPDF document...");
      const pdf = new jsPDF("p", "mm", "a4");
      console.log("Step 2: PDF document created successfully");

      // PDF dimensions and margins
      const pageWidth = 210;
      const pageHeight = 297;
      const marginLeft = 20;
      const marginRight = 20;
      const marginTop = 18;
      const marginBottom = 18;
      const usableWidth = pageWidth - marginLeft - marginRight;
      const bottomMargin = pageHeight - marginBottom;

      // Set font
      pdf.setFont("times", "normal");
      pdf.setFontSize(11);

      let currentY = marginTop;

      // Add title
      console.log("Step 3: Adding title...");
      pdf.setFont("times", "bold");
      pdf.setFontSize(16);
      pdf.text("RENT AGREEMENT", pageWidth / 2, currentY, { align: "center" });
      currentY += 15;

      pdf.setFont("times", "normal");
      pdf.setFontSize(11);

      // Process and add agreement content
      console.log("Step 4: Processing agreement content...");
      const normalizedText = normalizeAgreementText(generatedAgreement);
      console.log("Step 5: Text normalized, length:", normalizedText.length);
      const paragraphs = normalizedText.split(/\n\s*\n/);
      console.log("Step 6: Split into", paragraphs.length, "paragraphs");

      paragraphs.forEach((paragraph, index) => {
        const trimmedParagraph = paragraph.trim();
        if (!trimmedParagraph) return;

        // Check if this is a numbered clause, heading, or bullet
        const isNumberedClause = /^\d{1,2}[\).]/.test(trimmedParagraph);
        const isBullet = /^[•\-*]\s+/.test(trimmedParagraph) || /^\([a-zA-Z]\)\s+/.test(trimmedParagraph);
        const isHeading = /^[A-Z][A-Z\s]{6,}:$/.test(trimmedParagraph) || 
                        /^(PARTIES|RENT|DEPOSIT|DURATION|TERMINATION|SIGNATURE|WHEREAS|NOW THIS|IN WITNESS)/i.test(trimmedParagraph);

        if (index % 10 === 0) {
          console.log(`Processing paragraph ${index + 1}/${paragraphs.length}, currentY: ${currentY}`);
        }

        // Add space before sections
        if (isHeading && currentY > marginTop + 20) {
          currentY += 8;
        }

        // Add extra spacing before numbered clauses and bullets
        if ((isNumberedClause || isBullet) && currentY > marginTop + 30) {
          currentY += 3;
        }

        // Check if we need a new page
        if (currentY > bottomMargin - 20) {
          pdf.addPage();
          currentY = marginTop;
        }

        // Add content
        if (isHeading) {
          currentY += addSectionHeading(pdf, trimmedParagraph, marginLeft, currentY);
        } else if (isBullet) {
          // Add bullet with indentation
          const textHeight = addWrappedText(pdf, trimmedParagraph, marginLeft + 9, currentY, usableWidth - 9, 4.5);
          currentY += textHeight + 2; // Smaller spacing for bullets
        } else {
          const textHeight = addWrappedText(pdf, trimmedParagraph, marginLeft, currentY, usableWidth, 5);
          currentY += textHeight + 4; // Add space after paragraph
        }
      });

      // Add signature blocks
      console.log("Step 8: Adding signature blocks...");
      if (currentY > bottomMargin - 30) {
        pdf.addPage();
        currentY = marginTop;
      }
      currentY += 10;
      addSignatureBlocks(pdf, currentY);
      console.log("Step 9: Signature blocks added");

      // Add watermark for preview
      if (isWatermarked) {
        console.log("Step 10: Adding watermark...");
        addWatermark(pdf, "RentShield Preview");
        console.log("Step 11: Watermark added");
      }

      // Save the PDF
      console.log("Step 12: Saving PDF...");
      const filename = isWatermarked ? "RentShield-preview-agreement.pdf" : "RentShield-rent-agreement.pdf";
      pdf.save(filename);

      console.log("=== PDF GENERATED SUCCESSFULLY ===");

    } catch (error) {
      console.error("=== PDF GENERATION ERROR ===");
      console.error("Error:", error);
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
      console.error("Error code:", error.code);
      alert(`Failed to generate PDF: ${error.message}. Please try again.`);
    }
  };

// Block keyboard copy (Ctrl+C) on agreement area
useEffect(() => {
  const handler = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
      const container = document.getElementById("agreementContainer");
      if (container && container.contains(document.activeElement)) {
        e.preventDefault();
      }
    }
  };

  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}, []);

// Fetch user profile on mount
useEffect(() => {
  const fetchUserProfile = async () => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          
          // Ensure phone number has +91 prefix
          let phoneNumber = profileData.phoneNumber || profileData.phone || "";
          if (phoneNumber && !phoneNumber.startsWith('+91')) {
            phoneNumber = `+91${phoneNumber}`;
          }
          
          // Enrich profile data with normalized values
          const enrichedProfile = {
            ...profileData,
            fullName: profileData.fullName || profileData.name,
            phoneNumber: phoneNumber
          };
          
          setUserProfile(enrichedProfile);
          
          // Pre-fill form with user profile data
          setFormData(prev => ({
            ...prev,
            ownerName: enrichedProfile.userType === 'owner' ? enrichedProfile.fullName : prev.ownerName,
            ownerContact: enrichedProfile.userType === 'owner' ? enrichedProfile.phoneNumber : prev.ownerContact,
            tenantName: enrichedProfile.userType === 'tenant' ? enrichedProfile.fullName : prev.tenantName,
            tenantContact: enrichedProfile.userType === 'tenant' ? enrichedProfile.phoneNumber : prev.tenantContact
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  };

  fetchUserProfile();
}, [user]);

// Handle Cashfree success callback
useEffect(() => {
  // Listen for Cashfree success message
  const handleMessage = (event) => {
    if (event.data && event.data.type === 'CASHFREE_SUCCESS') {
      console.log("Cashfree payment successful:", event.data);
      setPaymentSuccess(true);
      setIsPaid(true);
      alert("Payment successful! You can now download the agreement.");
    }
  };

  window.addEventListener('message', handleMessage);
  
  return () => {
    window.removeEventListener('message', handleMessage);
  };
}, []);

console.log("DEBUG UI Agreement:", generatedAgreement);

  // Protect against crash
  if (!generatedAgreement) {
    console.log("Agreement not loaded yet");
  }

  // HTML helper to escape text
  const escapeHtml = (text) =>
    String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // Agreement HTML formatter that respects cleaned text with proper classes
  const getAgreementHTML = () => {
    if (!generatedAgreement) return "<p>No agreement available</p>";

    return generatedAgreement
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const safe = escapeHtml(block).replace(/\n/g, "<br />");

        if (/^(BETWEEN:|WHEREAS:|NOW THIS AGREEMENT|SIGNATURES:)/i.test(block)) {
          return `<p class="agreement-heading">${safe}</p>`;
        }

        if (/^\d+\.\s+[A-Z]/.test(block)) {
          return `<p class="agreement-clause">${safe}</p>`;
        }

        if (/^\d+\.\d+\s+/.test(block)) {
          return `<p class="agreement-subclause">${safe}</p>`;
        }

        return `<p class="agreement-paragraph">${safe}</p>`;
      })
      .join("");
  };

  // Download watermarked preview function
  const downloadWatermarked = () => {
    console.log("DOWNLOAD WATERMARKED CLICKED");
    console.log("generatedAgreement available:", !!generatedAgreement);
    console.log("agreementContainer available:", !!document.getElementById("agreementContainer"));
    
    generatePDF(true); // true for watermarked preview
  };

  // PDF download function for clean version
  const downloadPDF = () => {
    generatePDF(false); // false for clean PDF
  };

  // Payment handler for premium download
  const handlePayment = async () => {
    try {
      // Get customer details from user profile
      const customerName = userProfile?.fullName || userProfile?.name || "Customer";
      let customerPhone = userProfile?.phoneNumber || userProfile?.phone || "";
      const customerEmail = user?.email || "customer@example.com";
      
      // Ensure phone number has proper format
      if (customerPhone && !customerPhone.startsWith('+91')) {
        customerPhone = `+91${customerPhone}`;
      }
      
      console.log("Profile phone validation check:", customerPhone);
      console.log("User profile data:", userProfile);
      
      // Validate phone number using helper function that handles +91 prefix
      if (!customerPhone || !isValidIndianPhone(customerPhone)) {
        alert("Please enter a valid 10-digit Indian phone number in your profile (with or without +91 prefix). Current value: " + (customerPhone || 'empty'));
        return;
      }
      
      // Clean phone number for payment API (remove +91 if present)
      const cleanPhone = sanitizePhone(customerPhone);
      const normalizedPhone = cleanPhone.startsWith("91") && cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone;

      console.log("Sending payment request with:", {
        amount: 199,
        customer_name: customerName,
        customer_phone: normalizedPhone,
        customer_email: customerEmail
      });

      const response = await fetch("https://us-central1-rental-shield-a4638.cloudfunctions.net/createCashfreeOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: 199, // Send as number
          customer_name: customerName,
          customer_phone: normalizedPhone, // Send as 10-digit string
          customer_email: customerEmail
        })
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error("Backend error:", responseText);
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || "Payment request failed");
        } catch (e) {
          throw new Error(responseText || "Payment request failed");
        }
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Server returned invalid response: " + responseText);
      }

      console.log("Payment order created:", data);

      if (!data.success || !data.payment_session_id) {
        throw new Error(data.error || "Failed to create payment order");
      }

      const Cashfree = await loadCashfree();

      // Use production mode for live payments
      const cashfree = Cashfree({
        mode: "production"
      });

      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal"
      });

    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed: " + (error.message || "Unknown error occurred. Please check console for details."));
    }
  };

  try {
    return (
      <div style={{ 
        padding: "40px 24px",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#f8fafc",
        minHeight: "100vh"
      }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ 
          color: "#0f172a", 
          fontSize: "32px",
          fontWeight: "700",
          marginBottom: "16px"
        }}>
          Rent Agreement Generator
        </h1>
        <p style={{ color: "#475569", fontSize: "16px" }}>
          Create a legally compliant rental agreement in minutes
        </p>
      </div>

      {/* Property Details */}
      <div style={{
        background: "#ffffff",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "20px",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{ 
          color: "#0f172a", 
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "20px"
        }}>
          Property Details
        </h2>
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
            Property Address
          </label>
          <input
            name="propertyAddress"
            type="text"
            value={formData.propertyAddress}
            onChange={handleChange}
            placeholder="Enter complete property address"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px"
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
              City
            </label>
            <input
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              placeholder="Enter city"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "16px"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
              State
            </label>
            <input
              name="state"
              type="text"
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "16px"
              }}
            />
          </div>
        </div>
      </div>

      {/* Owner Details */}
      <div style={{
        background: "#ffffff",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "20px",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{ 
          color: "#0f172a", 
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "20px"
        }}>
          Owner Details
        </h2>
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
            Owner Name
          </label>
          <input
            name="ownerName"
            type="text"
            value={formData.ownerName}
            onChange={handleChange}
            placeholder="Enter owner's full name"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px"
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
            Owner Address
          </label>
          <input
            name="ownerAddress"
            type="text"
            value={formData.ownerAddress}
            onChange={handleChange}
            placeholder="Enter owner's residential address"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
            Owner Contact
          </label>
          <input
            name="ownerContact"
            type="text"
            value={formData.ownerContact}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
              color: "#000000",
              backgroundColor: "#ffffff"
            }}
          />
        </div>
      </div>

      {/* Tenant Details */}
      <div style={{
        background: "#ffffff",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "20px",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{ 
          color: "#0f172a", 
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "20px"
        }}>
          Tenant Details
        </h2>
        
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
            Tenant Name
          </label>
          <input
            name="tenantName"
            type="text"
            value={formData.tenantName}
            onChange={handleChange}
            placeholder="Enter tenant's full name"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px"
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
            Tenant Address
          </label>
          <input
            name="tenantAddress"
            type="text"
            value={formData.tenantAddress}
            onChange={handleChange}
            placeholder="Enter tenant's residential address"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
            Tenant Contact
          </label>
          <input
            name="tenantContact"
            type="text"
            value={formData.tenantContact}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
              color: "#000000",
              backgroundColor: "#ffffff"
            }}
          />
        </div>
      </div>

      {/* Agreement Terms */}
      <div style={{
        background: "#ffffff",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "20px",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{ 
          color: "#0f172a", 
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "20px"
        }}>
          Agreement Terms
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
              Monthly Rent (₹)
            </label>
            <input
              name="rent"
              type="number"
              value={formData.rent}
              onChange={handleChange}
              placeholder="Enter monthly rent amount"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "16px"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
              Security Deposit (₹)
            </label>
            <input
              name="deposit"
              type="number"
              value={formData.deposit}
              onChange={handleChange}
              placeholder="Enter security deposit amount"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "16px"
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
              Start Date
            </label>
            <input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "16px"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
              Duration (months)
            </label>
            <input
              name="duration"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              placeholder="11"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "16px"
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: "8px" }}>
              Notice Period (days)
            </label>
            <input
              name="noticePeriod"
              type="number"
              value={formData.noticePeriod}
              onChange={handleChange}
              placeholder="30"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "16px"
              }}
            />
          </div>
        </div>
      </div>

      {/* Custom Clauses */}
      <div style={{
        background: "#ffffff",
        padding: "24px",
        borderRadius: "12px",
        marginBottom: "30px",
        border: "1px solid #e5e7eb"
      }}>
        <h2 style={{ 
          color: "#0f172a", 
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "20px"
        }}>
          Custom Clauses (Optional)
        </h2>
        
        <textarea
          name="customClauses"
          value={formData.customClauses}
          onChange={handleChange}
          placeholder="Add any custom clauses specific to your agreement (e.g., pet policy, maintenance responsibilities, etc.)..."
          style={{
            width: "100%",
            height: "120px",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontSize: "16px",
            resize: "vertical"
          }}
        />
      </div>

      {/* CTA Button */}
      <div style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={generateAgreement}
          style={{
            padding: "14px 28px",
            background: "#f97316",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Generate & Preview Agreement
        </button>
      </div>

      {/* Agreement Preview - ONLY RENDER AFTER BUTTON CLICK */}
      {showPreview && generatedAgreement && (
        <div 
          id="agreementContainer"
          style={{
            position: "relative",
            width: "794px",
            margin: "40px auto",
            padding: "40px",
            background: "#fff",
            fontFamily: "Times New Roman, serif",
            fontSize: "12px",
            lineHeight: "1.5",
            color: "#000",
            textAlign: "justify",
            boxShadow: "0 0 20px rgba(0,0,0,0.1)",
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            cursor: "default"
          }}
          onContextMenu={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Watermark - Only show for unpaid users */}
          {!isPaid && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-30deg)",
              fontSize: "50px",
              color: "rgba(0, 0, 0, 0.08)",
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
              fontWeight: "700",
              letterSpacing: "2px",
              zIndex: 1
            }}>
              RentShield - Preview
            </div>
          )}

          {/* Agreement Content Wrapper */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <h1 style={{
              textAlign: "center",
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "40px",
              marginTop: "20px"
            }}>
              RENT AGREEMENT
            </h1>

            {/* Agreement Content */}
            <div id="agreement-content" style={{
              display: "block !important",
              visibility: "visible !important",
              opacity: "1 !important",
              whiteSpace: "normal",
              lineHeight: "1.7",
              fontSize: "12px",
              textAlign: "justify",
              marginBottom: "10px"
            }}>
              <style>
                {`
                  .agreement-paragraph {
                    margin: 0 0 12px;
                    text-align: justify;
                    line-height: 1.7;
                  }
                  .agreement-clause {
                    margin: 18px 0 8px;
                    font-weight: bold;
                    text-align: left;
                    line-height: 1.7;
                  }
                  .agreement-subclause {
                    margin: 8px 0 8px 18px;
                    text-align: justify;
                    line-height: 1.7;
                  }
                  .agreement-heading {
                    margin: 18px 0 10px;
                    font-weight: bold;
                    text-align: left;
                    text-transform: uppercase;
                  }
                  .agreement-bullet {
                    margin: 8px 0 8px 18px;
                    text-align: justify;
                    line-height: 1.65;
                  }
                `}
              </style>
              {generatedAgreement ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: getAgreementHTML()
                  }}
                />
              ) : (
                <p>Loading agreement...</p>
              )}
            </div>

            {/* Signature Section */}
            <div style={{ marginTop: "80px", pageBreakInside: "avoid" }}>
              <p style={{ textAlign: "center", fontWeight: "bold", marginBottom: "40px" }}>
                IN WITNESS WHEREOF
              </p>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "60px"
              }}>
                <div style={{ textAlign: "center", width: "45%" }}>
                  <div style={{ borderBottom: "1px solid #000", marginBottom: "10px", height: "40px" }}></div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>OWNER</p>
                </div>

                <div style={{ textAlign: "center", width: "45%" }}>
                  <div style={{ borderBottom: "1px solid #000", marginBottom: "10px", height: "40px" }}></div>
                  <p style={{ margin: 0, fontWeight: "bold" }}>TENANT</p>
                </div>
              </div>

              <div style={{ marginTop: "60px" }}>
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ borderBottom: "1px solid #000", marginBottom: "5px", width: "200px" }}></div>
                  <p style={{ margin: 0, fontSize: "11px" }}>Witness 1</p>
                </div>
                <div>
                  <div style={{ borderBottom: "1px solid #000", marginBottom: "5px", width: "200px" }}></div>
                  <p style={{ margin: 0, fontSize: "11px" }}>Witness 2</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Payment Section */}
      {showPreview && (
        <div style={{
          position: "relative",
          marginTop: "40px",
          padding: "30px",
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #ddd"
        }}>
          {/* Watermark Overlay */}
          <div style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-30deg)",
            fontSize: "40px",
            color: "rgba(0,0,0,0.1)",
            pointerEvents: "none",
            fontWeight: "700",
            letterSpacing: "2px"
          }}>
            RentShield Preview
          </div>

          <div style={{ textAlign: "center", marginTop: "30px", position: "relative", zIndex: "1" }}>
            <div className="download-actions" style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => {
                  console.log("🔥 Download button clicked");
                  generatePDF(true);
                }}
                style={{
                  padding: "14px 28px",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                Download Preview (Free)
              </button>

              <button
                className="premium-btn"
                onClick={handlePayment}
                disabled={!generatedAgreement || generatedAgreement.length < 50}
                style={{
                  padding: "16px 32px",
                  background: (!generatedAgreement || generatedAgreement.length < 50) ? "#9ca3af" : "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: (!generatedAgreement || generatedAgreement.length < 50) ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: (!generatedAgreement || generatedAgreement.length < 50) ? "none" : "0 4px 12px rgba(37, 99, 235, 0.3)",
                  opacity: (!generatedAgreement || generatedAgreement.length < 50) ? 0.6 : 1
                }}
              >
                Download Clean PDF – ₹199
              </button>
            </div>

            <div style={{ 
              marginTop: "20px", 
              padding: "16px", 
              background: "#f0f9ff", 
              borderRadius: "8px", 
              border: "1px solid #bfdbfe",
              textAlign: "left",
              fontSize: "14px",
              color: "#1e40af"
            }}>
              <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#1e40af" }}>Premium Features:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div>✔ Legally structured agreement</div>
                <div>✔ Clean formatted PDF</div>
                <div>✔ Ready for print & signing</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  } catch (err) {
    console.error("Render crash:", err);
    return <div>Error loading page</div>;
  }
}
