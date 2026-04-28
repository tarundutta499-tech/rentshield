import React from "react";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";

const steps = [
  {
    title: "Create your account",
    body: "Sign up with email/password or phone number, then choose your role (Tenant or Landlord)."
  },
  {
    title: "Upload a rental agreement",
    body: "Upload a PDF agreement to secure storage and create a verified record shared between parties."
  },
  {
    title: "Manage disputes with evidence",
    body: "Raise a dispute by category, attach evidence, and keep communications in one structured thread."
  },
  {
    title: "Generate legal notices",
    body: "Create professionally formatted notices for deposit recovery, eviction, or rent default."
  },
  {
    title: "Build reputation",
    body: "Reputation score updates based on payment history, dispute outcomes, and agreement compliance."
  }
];

export function HowItWorksPage() {
  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Typography variant="h4" sx={{ fontWeight: 950, letterSpacing: -0.6 }}>
          How RentShield works
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 860 }}>
          A simple, auditable flow designed for rental clarity—without complexity.
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {steps.map((s, idx) => (
          <Grid key={s.title} item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
              <CardContent>
                <Stack spacing={0.75}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>
                    Step {idx + 1}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {s.title}
                  </Typography>
                  <Typography color="text.secondary">{s.body}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

