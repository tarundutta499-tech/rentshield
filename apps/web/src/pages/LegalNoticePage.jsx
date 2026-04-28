import React, { useMemo, useState } from "react";
import { Alert, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { apiPost } from "../lib/api.js";
import { useAuth } from "../state/AuthProvider.jsx";

const noticeTypes = [
  { id: "deposit_recovery", label: "Deposit recovery" },
  { id: "eviction_notice", label: "Eviction notice" },
  { id: "rent_default", label: "Rent default notice" }
];

export function LegalNoticePage() {
  const { profile } = useAuth();
  const [noticeType, setNoticeType] = useState("deposit_recovery");
  const [jurisdiction, setJurisdiction] = useState("Generic");
  const [partyA, setPartyA] = useState("");
  const [partyB, setPartyB] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [facts, setFacts] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const role = profile?.role ?? null;
  const typeLabel = useMemo(() => noticeTypes.find((t) => t.id === noticeType)?.label ?? noticeType, [noticeType]);

  const generate = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await apiPost("/api/legal-notice", {
        noticeType,
        jurisdiction,
        role,
        partyA,
        partyB,
        propertyAddress,
        amount,
        facts
      });
      setNotice(res.noticeText || "");
    } catch (e) {
      setError(e?.message ?? "Failed to generate notice");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    if (!notice) return;
    await navigator.clipboard.writeText(notice);
  };

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
          Legal Notice Generator
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 900 }}>
          Generate a professional notice template. Always review for your jurisdiction and consult a qualified attorney when needed.
        </Typography>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={1.5}>
                <TextField select label="Notice type" value={noticeType} onChange={(e) => setNoticeType(e.target.value)}>
                  {noticeTypes.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="Jurisdiction" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} />
                <TextField label="Sender (Party A)" value={partyA} onChange={(e) => setPartyA(e.target.value)} placeholder="e.g., Landlord name / Tenant name" />
                <TextField label="Recipient (Party B)" value={partyB} onChange={(e) => setPartyB(e.target.value)} placeholder="e.g., Tenant name / Landlord name" />
                <TextField label="Property address" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} />
                <TextField label="Amount (optional)" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g., 1200" />
                <TextField
                  label="Key facts"
                  value={facts}
                  onChange={(e) => setFacts(e.target.value)}
                  multiline
                  minRows={4}
                  placeholder="Dates, timeline, what happened, what you request, deadlines if any."
                />
                <Button variant="contained" size="large" onClick={generate} disabled={busy}>
                  Generate {typeLabel}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    Generated notice
                  </Typography>
                  <Button size="small" onClick={copy} startIcon={<ContentCopyIcon />} disabled={!notice}>
                    Copy
                  </Button>
                </Stack>
                <TextField value={notice} multiline minRows={18} placeholder="Your generated notice will appear here." />
                <Typography variant="caption" color="text.secondary">
                  Template output is a starting point and may require jurisdiction-specific language and formatting.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

