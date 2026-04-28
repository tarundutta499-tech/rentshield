import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent,
  Stack, Button, Divider, Alert
} from '@mui/material';
import {
  Shield, Security, Lock, CheckCircle,
  Email, Phone, Storage, UploadFile
} from '@mui/icons-material';

// Error boundary for catching rendering errors
class PrivacyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Privacy Policy page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert severity="error">
            <Typography variant="h6">
              Something went wrong loading this page.
            </Typography>
            <Typography variant="body2">
              Please refresh the page or try again later.
            </Typography>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

function PrivacyPolicyPageWithErrorBoundary() {
  return (
    <PrivacyErrorBoundary>
      <PrivacyPolicyPageContent />
    </PrivacyErrorBoundary>
  );
}

function PrivacyPolicyPageContent() {
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
              Privacy Policy
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              Your privacy is our priority
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          {/* PRIVACY CONTENT */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  At RentShield, we value your privacy and are committed to protecting your personal information.
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Information We Collect
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Lock sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Name, phone number, email address
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Basic contact information for account creation and communication
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Storage sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Property and rental details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Addresses, rent amounts, lease terms, and property information
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <UploadFile sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Uploaded documents
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Agreements, ID proofs, and payment records
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Security sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Usage and device information
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        How you use our platform and technical access data
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  How We Use Your Information
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircle sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Provide and improve services
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Enhance platform functionality and user experience
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircle sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Store and manage agreements
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Secure storage and organization of your rental documents
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircle sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Send updates and reminders
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Important dates and notifications about your rental agreements
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircle sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Enhance security
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Protect your account and prevent unauthorized access
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Data Sharing
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Shield sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        No selling of user data
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        We never sell your personal information to third parties
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Shield sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Shared only when legally required
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Data is shared only when necessary for service provision or legal compliance
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Your Rights
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Security sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Access your data
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View, download, or delete your personal information at any time
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Security sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Correct your data
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Update or fix inaccuracies in your personal information
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Security sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Request deletion
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ask us to delete your account and all associated data
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Contact Us
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Email sx={{ color: '#1565C0', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        Email: support@rentshield.in
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        For privacy-related questions and concerns
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>

                <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(21,101,192,0.05)', borderRadius: 2 }}>
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

export { PrivacyPolicyPageWithErrorBoundary as PrivacyPolicyPage };
