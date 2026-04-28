import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "rentshield-api" });
});

function nowDateString() {
  const d = new Date();
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" });
}

function normalizeMoney(amount) {
  const n = Number(String(amount ?? "").replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n.toFixed(2);
}

function buildNotice({ noticeType, jurisdiction, role, partyA, partyB, propertyAddress, amount, facts }) {
  const date = nowDateString();
  const money = normalizeMoney(amount);

  const header = `RENTAL LEGAL NOTICE (TEMPLATE)\n${jurisdiction ? `Jurisdiction: ${jurisdiction}\n` : ""}Date: ${date}\n`;

  const parties = `\nFrom (Party A): ${partyA || "[Name]"}\nTo (Party B): ${partyB || "[Name]"}\nProperty: ${propertyAddress || "[Address]"}\n`;

  const common = `\nSummary of facts:\n${facts?.trim() ? facts.trim() : "[Insert a clear timeline of events, dates, and supporting details.]"}\n\nRequested action and deadline:\n[State what you are requesting and by when.]\n\nReservation of rights:\nThis notice is provided without prejudice. All rights and remedies are reserved.\n`;

  if (noticeType === "deposit_recovery") {
    return (
      header +
      `\nSubject: Demand for return of security deposit\n\n` +
      parties +
      `\nI am writing to formally demand the return of the security deposit${money ? ` in the amount of $${money}` : ""}.\n` +
      `\nIf you believe any deductions are justified, please provide an itemized statement with supporting documentation.\n` +
      common +
      `\nSignature:\n${partyA || "[Party A]"}\n`
    );
  }

  if (noticeType === "rent_default") {
    return (
      header +
      `\nSubject: Notice of rent default and demand to cure\n\n` +
      parties +
      `\nThis letter serves as formal notice of rent default${money ? ` for the amount of $${money}` : ""}.\n` +
      `\nPlease cure the default by paying all outstanding rent and fees by the deadline stated below, or provide written proof of payment.\n` +
      common +
      `\nSignature:\n${partyA || "[Party A]"}\n`
    );
  }

  if (noticeType === "eviction_notice") {
    const who = role === "tenant" ? "tenant" : "landlord";
    return (
      header +
      `\nSubject: Notice regarding termination of tenancy / eviction proceedings\n\n` +
      parties +
      `\nThis notice is provided in relation to the tenancy at the above address.\n` +
      `\n${who === "landlord" ? "The tenant is hereby notified" : "The landlord is hereby notified"} that termination and/or eviction proceedings may be initiated if the issues described below are not resolved.\n` +
      common +
      `\nSignature:\n${partyA || "[Party A]"}\n`
    );
  }

  return (
    header +
    `\nSubject: General rental notice\n\n` +
    parties +
    common +
    `\nSignature:\n${partyA || "[Party A]"}\n`
  );
}

app.post("/api/legal-notice", (req, res) => {
  const { noticeType, jurisdiction, role, partyA, partyB, propertyAddress, amount, facts } = req.body ?? {};
  if (!noticeType) return res.status(400).json({ error: "noticeType is required" });

  const noticeText = buildNotice({
    noticeType,
    jurisdiction: jurisdiction || "Generic",
    role,
    partyA,
    partyB,
    propertyAddress,
    amount,
    facts
  });

  res.json({ noticeText });
});

const port = Number(process.env.PORT || 5179);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`RentShield API listening on http://localhost:${port}`);
});

