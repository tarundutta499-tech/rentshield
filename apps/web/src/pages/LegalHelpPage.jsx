import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthProvider.jsx";
import {
  Container, Typography, Button, Stack, Card, CardContent
} from "@mui/material";
import { Gavel as GavelIcon } from "@mui/icons-material";

export default function LegalHelpPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Legal Help Center
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate("/intent")}
            sx={{ textTransform: "none" }}
          >
            Change Intent
          </Button>
        </Stack>

        <Typography variant="h6" color="text.secondary">
            Welcome, {profile?.displayName || user?.displayName || "Legal Professional"}!
          </Typography>

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <GavelIcon sx={{ fontSize: 64, color: "#388e3c" }} />
                <Typography variant="h6">Create Rental Agreements</Typography>
                <Typography color="text.secondary" textAlign="center">
                  Generate legally compliant rental agreements
                </Typography>
                <Button variant="contained" fullWidth>
                  Create Agreement
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6">Legal Templates</Typography>
                <Typography color="text.secondary">
                  Access legal document templates and resources
                </Typography>
                <Button variant="outlined" fullWidth>
                  Browse Templates
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6">Legal Guidance</Typography>
                <Typography color="text.secondary">
                  Get guidance on rental laws and regulations
                </Typography>
                <Button variant="outlined" fullWidth>
                  View Resources
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
