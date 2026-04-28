import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthProvider.jsx";
import {
  Container, Typography, Button, Stack, Card, CardContent
} from "@mui/material";
import { Business as BusinessIcon } from "@mui/icons-material";

export default function LandlordDashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Landlord Dashboard
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
            Welcome back, {profile?.displayName || user?.displayName || "Landlord"}!
          </Typography>

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <BusinessIcon sx={{ fontSize: 64, color: "#f57c00" }} />
                <Typography variant="h6">My Properties</Typography>
                <Typography color="text.secondary" textAlign="center">
                  Manage your rental properties and listings
                </Typography>
                <Button variant="contained" fullWidth>
                  Manage Properties
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6">Tenants</Typography>
                <Typography color="text.secondary">
                  View and manage your current tenants
                </Typography>
                <Button variant="outlined" fullWidth>
                  View Tenants
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6">Rental Agreements</Typography>
                <Typography color="text.secondary">
                  Create and manage rental agreements
                </Typography>
                <Button variant="outlined" fullWidth>
                  Manage Agreements
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
