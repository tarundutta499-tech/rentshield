import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Card, CardContent,
  Stack, Button, TextField, Alert, Grid
} from '@mui/material';
import {
  Email, Phone, Support, LocationOn,
  Send, Schedule, Message, UploadFile, Security
} from '@mui/icons-material';

// Error boundary for catching rendering errors
class ContactErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Contact page error:', error, errorInfo);
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

export { ContactPageWithErrorBoundary as ContactPage };

function ContactPageWithErrorBoundary() {
  return (
    <ContactErrorBoundary>
      <ContactPageContent />
    </ContactErrorBoundary>
  );
}

function ContactPageContent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would typically send this to your backend
      console.log('Contact form submitted:', formData);
      
      // Simulate successful submission
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // In production, you would send to your backend:
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // if (!response.ok) throw new Error('Failed to send message');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const supportTypes = [
    {
      icon: <Schedule />,
      title: "Account Issues",
      description: "Problems with login, registration, or account settings"
    },
    {
      icon: <UploadFile />,
      title: "Agreement Upload Problems",
      description: "Issues uploading or managing rental agreements"
    },
    {
      icon: <Security />,
      title: "Verification Support",
      description: "Help with identity verification and document requirements"
    },
    {
      icon: <Message />,
      title: "Bugs and Technical Issues",
      description: "Report platform bugs or technical difficulties"
    },
    {
      icon: <Support />,
      title: "General Questions",
      description: "Any other questions about RentShield services"
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
              Contact Us
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              We're here to help with any questions or issues
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          {/* CONTACT INFO */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={4}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                  Get in Touch
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Email sx={{ color: '#1565C0' }} />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Email
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            support@rentshield.in
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Schedule sx={{ color: '#1565C0' }} />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Response Time
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            24–48 business hours
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    For the fastest response, please include your account details and a detailed description of your issue.
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>

          {/* SUPPORT TYPES */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                How can we help you?
              </Typography>
              
              <Grid container spacing={3}>
                {supportTypes.map((type, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{
                      p: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack spacing={2} alignItems="center" textAlign="center">
                          <Box sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(21,101,192,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#1565C0'
                          }}>
                            {type.icon}
                          </Box>
                          <Typography variant="body2" fontWeight={600} textAlign="center">
                            {type.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" textAlign="center">
                            {type.description}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* CONTACT FORM */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                Send us a Message
              </Typography>
              
              {submitted ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    Thank you for contacting us! We'll get back to you within 24-48 business hours.
                  </Typography>
                </Alert>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      required
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      required
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Subject"
                      value={formData.subject}
                      onChange={handleInputChange('subject')}
                      required
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange('message')}
                      required
                      sx={{ mb: 3 }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      startIcon={<Send />}
                      sx={{ py: 1.5 }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* CALL TO ACTION */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
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
