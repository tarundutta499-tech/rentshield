import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import { db } from "../lib/firebase.js";
import { useAuth } from "../state/AuthProvider.jsx";
import { calculateReputationScore } from "../lib/scoring.js";

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [role, setRole] = useState(profile?.role ?? "tenant");
  const [verifiedBadge, setVerifiedBadge] = useState(Boolean(profile?.verifiedBadge));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [agreements, setAgreements] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [onTimePayments, setOnTimePayments] = useState(profile?.onTimePayments ?? 10);
  const [latePayments, setLatePayments] = useState(profile?.latePayments ?? 1);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    async function load() {
      const [aSnap, dSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "agreements")),
        getDocs(collection(db, "users", user.uid, "disputes"))
      ]);
      if (!alive) return;
      setAgreements(aSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setDisputes(dSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
    return () => {
      alive = false;
    };
  }, [user]);

  const computedScore = useMemo(() => {
    const totalPayments = onTimePayments + latePayments;
    const onTimePaymentRate = totalPayments > 0 ? onTimePayments / totalPayments : 0.85;
    const disputesOpen = disputes.filter((d) => d.status !== "closed").length;
    const disputesClosed = disputes.filter((d) => d.status === "closed").length;
    const avgHealth =
      agreements.length > 0 ? agreements.reduce((sum, a) => sum + (a.healthScore ?? 0), 0) / (agreements.length * 100) : 0.7;
    return calculateReputationScore({
      onTimePaymentRate,
      disputesOpen,
      disputesClosed,
      agreementHealth: avgHealth
    });
  }, [agreements, disputes, onTimePayments, latePayments]);

  const save = async () => {
    if (!user) return;
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          role,
          verifiedBadge,
          onTimePayments,
          latePayments,
          reputationScore: computedScore,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      setSuccess("Profile updated.");
    } catch (e) {
      setError(e?.message ?? "Failed to update profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
          Profile
        </Typography>
        <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>{(user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase()}</Avatar>
                  <Stack spacing={0.2}>
                    <Typography sx={{ fontWeight: 900 }}>{user?.displayName || "User"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email || user?.phoneNumber || user?.uid}
                    </Typography>
                  </Stack>
                </Stack>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {verifiedBadge ? <Chip icon={<VerifiedIcon />} label="Verified" color="secondary" /> : <Chip label="Not verified" variant="outlined" />}
                  <Chip label={`Reputation: ${computedScore}`} color="primary" variant="outlined" />
                </Box>

                <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                  <MenuItem value="tenant">Tenant</MenuItem>
                  <MenuItem value="landlord">Landlord</MenuItem>
                </TextField>

                <Button
                  variant={verifiedBadge ? "contained" : "outlined"}
                  color="secondary"
                  onClick={() => setVerifiedBadge((v) => !v)}
                >
                  {verifiedBadge ? "Verified badge enabled" : "Enable verified badge (demo)"}
                </Button>

                <TextField
                  label="On-time payments (last 12 months, demo)"
                  type="number"
                  value={onTimePayments}
                  onChange={(e) => setOnTimePayments(Number(e.target.value || 0))}
                />
                <TextField
                  label="Late / missed payments (last 12 months, demo)"
                  type="number"
                  value={latePayments}
                  onChange={(e) => setLatePayments(Number(e.target.value || 0))}
                />

                <Button variant="contained" size="large" onClick={save} disabled={busy}>
                  Save changes
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Rental history
                </Typography>
                <Typography color="text.secondary">
                  Agreements, disputes, and payment history are combined into your rental reputation score.
                </Typography>

                <Box sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Agreements ({agreements.length})
                  </Typography>
                  {agreements.length ? (
                    agreements.map((a) => (
                      <Typography key={a.id} variant="body2" color="text.secondary">
                        - {(a.title || "Rental agreement")} • Health {a.healthScore ?? 0}/100
                        {a.counterpartyEmail ? ` • Shared with ${a.counterpartyEmail}` : ""}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No agreements yet.
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mt: 1, p: 2, borderRadius: 2, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    Disputes ({disputes.length})
                  </Typography>
                  {disputes.length ? (
                    disputes.map((d) => (
                      <Typography key={d.id} variant="body2" color="text.secondary">
                        - {(d.categoryLabel || d.category || "Dispute")} • {d.status || "open"}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No disputes yet.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

