import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthProvider.jsx";
import {
  Container, Typography, Button, Stack, Card, CardContent
} from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";

export default function TenantDashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Tenant Dashboard
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
            Welcome back, {profile?.displayName || user?.displayName || "Tenant"}!
          </Typography>

        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <HomeIcon sx={{ fontSize: 64, color: "#1976d2" }} />
                <Typography variant="h6">Looking for Rentals</Typography>
                <Typography color="text.secondary" textAlign="center">
                  Browse available properties and manage your rental applications
                </Typography>
                <Button variant="contained" fullWidth>
                  Browse Properties
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6">My Applications</Typography>
                <Typography color="text.secondary">
                  Track your rental application status
                </Typography>
                <Button variant="outlined" fullWidth>
                  View Applications
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6">Legal Documents</Typography>
                <Typography color="text.secondary">
                  Access your rental agreements and legal documents
                </Typography>
                <Button variant="outlined" fullWidth>
                  View Documents
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
}
