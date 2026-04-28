import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthProvider.jsx";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase.js";
import {
  Box, Button, Card, CardContent, Container,
  Typography, Stack, CircularProgress
} from "@mui/material";
import {
  Home as HomeIcon, Business as BusinessIcon,
  Gavel as GavelIcon
} from "@mui/icons-material";

export default function IntentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleIntentSelect = async (intent) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Save intent to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.displayName,
        intent: intent,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Redirect based on selection
      switch (intent) {
        case "tenant":
          navigate("/tenant-dashboard");
          break;
        case "landlord":
          navigate("/landlord-dashboard");
          break;
        case "legal":
          navigate("/legal-help");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error saving intent:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h6" color="error">
          Please sign in to continue
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack spacing={4} textAlign="center">
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            What brings you to RentShield?
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Choose your current need to get started
          </Typography>
        </Box>

        <Stack 
          direction={{ xs: "column", md: "row" }} 
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
        >
          <Card 
            sx={{ 
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6
              }
            }}
            onClick={() => handleIntentSelect("tenant")}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <HomeIcon sx={{ fontSize: 64, color: "#1976d2", mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                I am a Tenant
              </Typography>
              <Typography color="text.secondary">
                Looking for rental properties and managing my lease agreements
              </Typography>
              {loading && (
                <CircularProgress sx={{ mt: 2 }} />
              )}
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6
              }
            }}
            onClick={() => handleIntentSelect("landlord")}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <BusinessIcon sx={{ fontSize: 64, color: "#f57c00", mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                I am a Landlord
              </Typography>
              <Typography color="text.secondary">
                Managing properties and finding reliable tenants
              </Typography>
              {loading && (
                <CircularProgress sx={{ mt: 2 }} />
              )}
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6
              }
            }}
            onClick={() => handleIntentSelect("legal")}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <GavelIcon sx={{ fontSize: 64, color: "#388e3c", mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                I want Legal Help
              </Typography>
              <Typography color="text.secondary">
                Creating rental agreements and legal documentation
              </Typography>
              {loading && (
                <CircularProgress sx={{ mt: 2 }} />
              )}
            </CardContent>
          </Card>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          You can change this selection later from your dashboard
        </Typography>
      </Stack>
    </Container>
  );
}
