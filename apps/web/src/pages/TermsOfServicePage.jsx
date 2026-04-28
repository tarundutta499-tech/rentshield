import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent,
  Stack, Button, Divider, Alert
} from '@mui/material';
import {
  Shield, Gavel, Warning, CheckCircle,
  Description, Security
} from '@mui/icons-material';

export function TermsOfServicePage() {
  const navigate = useNavigate();

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
              Terms of Service
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Please read these terms carefully before using RentShield
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          {/* DISCLAIMER */}
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body2">
              RentShield is a technology platform, not a broker or legal advisor. 
              These terms govern your use of our digital rental agreement management service.
            </Typography>
          </Alert>

          {/* TERMS CONTENT */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  User Responsibilities
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircle sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Accurate Information
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Users must provide accurate and truthful information when creating accounts and agreements
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircle sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Proper Platform Use
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Use RentShield only for legitimate rental agreement management purposes
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircle sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        No Misuse
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Users must not misuse the platform for fraudulent or illegal activities
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Platform Limitations
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Warning sx={{ color: '#F59E0B', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Not a Legal Advisor
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        RentShield does not provide legal advice or act as a real estate broker
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Warning sx={{ color: '#F59E0B', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        No Liability for User Disputes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        We are not responsible for disputes between landlords and tenants
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Warning sx={{ color: '#F59E0B', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Technical Limitations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Service availability may be affected by technical issues beyond our control
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Intellectual Property
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Shield sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Platform Ownership
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        RentShield and all content, features, and functionality are owned by RentShield
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Shield sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        User Content
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Users retain ownership of their uploaded documents and information
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Service Modifications
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Description sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Terms May Be Updated
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        We reserve the right to modify these terms with reasonable notice
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Description sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Service Changes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Features and pricing may change over time
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Account Termination
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Gavel sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        User Termination Rights
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Users may terminate their accounts at any time and request data deletion
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Gavel sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Platform Termination
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        We reserve the right to suspend or terminate accounts for violations
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(21,101,192,0.05)', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    By using RentShield, you agree to these terms and conditions.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Last updated: {new Date().toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* CALL TO ACTION */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{ px: 4, py: 1.5 }}
            >
              Back to Home
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
