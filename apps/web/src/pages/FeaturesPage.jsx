import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent,
  Grid, Stack, Button
} from '@mui/material';
import {
  Shield, Description, Security, UploadFile,
  Insights, Support, CheckCircle
} from '@mui/icons-material';

export function FeaturesPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Description />,
      title: "Digital Rental Agreements",
      description: "Create and store rental agreements digitally in one secure place with legally compliant templates."
    },
    {
      icon: <Security />,
      title: "Identity Verification",
      description: "Verify owner and tenant details to reduce fraud and improve trust in rental relationships."
    },
    {
      icon: <UploadFile />,
      title: "Document Management",
      description: "Upload and manage documents such as ID proofs, agreements, and payment records."
    },
    {
      icon: <Insights />,
      title: "Smart Tracking",
      description: "Track important dates like rent due dates, renewals, and notice periods with reminders."
    },
    {
      icon: <CheckCircle />,
      title: "Agreement Insights",
      description: "Get agreement insights through smart checks and scoring to identify potential issues."
    },
    {
      icon: <Support />,
      title: "24/7 Support",
      description: "Raise support requests for rental-related issues and disputes with quick response times."
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* HERO BANNER */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1565C0, #1E3A8A)',
        py: { xs: 6, md: 8 },
        px: { xs: 3, md: 6 },
      }}>
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography variant="h3" sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 800,
              color: 'white',
            }}>
              RentShield Features
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Everything you need to manage rental relationships with confidence
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          {/* MAIN FEATURES GRID */}
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={3} alignItems="center" textAlign="center">
                      <Box sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(21,101,192,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#1565C0',
                        fontSize: '1.5rem'
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" textAlign="center">
                        {feature.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* CALL TO ACTION */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Ready to get started?
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/auth')}
                sx={{ px: 4, py: 1.5 }}
              >
                Sign Up Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/')}
                sx={{ px: 4, py: 1.5 }}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
