import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";

export function StatCard({ label, value, helper }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
            {value}
          </Typography>
          {helper ? (
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

