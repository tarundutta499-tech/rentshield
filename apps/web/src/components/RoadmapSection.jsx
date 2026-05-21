import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  Button,
  useTheme,
  alpha,
  Fade,
  Slide
} from '@mui/material';
import {
  CreditScore as CreditScoreIcon,
  AccountBalanceWallet as WalletIcon,
  VerifiedUser as VerifiedUserIcon,
  Shield as ShieldIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

export default function RoadmapSection() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const features = [
    {
      title: "Rental Credit Score",
      icon: CreditScoreIcon,
      description: "Your rental history, turned into a score. Build credit simply by paying rent on time — unlock better homes and lower deposits."
    },
    {
      title: "Smart Rent Payments",
      icon: WalletIcon,
      description: "Automate rent collection with UPI, split payments for co-tenants, and get instant receipts — zero friction every month."
    },
    {
      title: "Rental Reputation Profile",
      icon: VerifiedUserIcon,
      description: "A verified digital profile that travels with you. Show landlords you're a trusted tenant before you even apply."
    },
    {
      title: "AI Risk Detection",
      icon: ShieldIcon,
      description: "AI that flags suspicious listings, problematic tenants, and risky clauses in agreements — before you sign anything."
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle email submission here
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <Box
      ref={sectionRef}
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 3, md: 6 },
        background: 'linear-gradient(135deg, #0A1628 0%, #0F1E35 50%, #1A2B4A 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 50%, ${alpha('#00D4B8', 0.1)} 0%, transparent 50%), 
                      radial-gradient(circle at 80% 50%, ${alpha('#F5A623', 0.1)} 0%, transparent 50%)`,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Fade in={isVisible} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            {/* Eyebrow label */}
            <Chip
              label="🚀 Product Roadmap"
              sx={{
                mb: 3,
                backgroundColor: 'transparent',
                border: '1px solid #00D4B8',
                color: '#00D4B8',
                fontWeight: 500,
                fontSize: '0.875rem',
                fontFamily: 'DM Sans, sans-serif',
                px: 2,
                py: 0.5
              }}
            />

            {/* Main heading */}
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                color: '#FFFFFF',
                mb: 3,
                lineHeight: 1.2
              }}
            >
              The Future of Renting in India
            </Typography>

            {/* Subtext */}
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                color: alpha('#FFFFFF', 0.8),
                maxWidth: '800px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              We're building tools that make renting transparent, safe, and stress-free — for everyone.
            </Typography>
          </Box>
        </Fade>

        {/* Feature Cards Grid */}
        <Grid container spacing={4} sx={{ mb: { xs: 8, md: 10 } }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={feature.title}>
              <Slide
                in={isVisible}
                direction="up"
                timeout={1000 + index * 150}
                style={{ transformOrigin: 'bottom' }}
              >
                <Card
                  sx={{
                    backgroundColor: alpha('#0F1E35', 0.8),
                    border: `1px solid ${alpha('#00D4B8', 0.2)}`,
                    borderRadius: '20px',
                    p: 3,
                    height: '100%',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 40px ${alpha('#00D4B8', 0.3)}`,
                      border: `1px solid ${alpha('#00D4B8', 0.4)}`
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: '20px',
                      padding: '1px',
                      background: 'linear-gradient(45deg, transparent, #00D4B8, transparent)',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'exclude',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover::before': {
                      opacity: 1
                    }
                  }}
                >
                  {/* COMING SOON Badge */}
                  <Chip
                    label="COMING SOON"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: '#F5A623',
                      color: '#0A1628',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      fontFamily: 'DM Sans, sans-serif',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                        '100%': { opacity: 1 }
                      }
                    }}
                  />

                  <CardContent sx={{ p: 0, pt: 1 }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                        mt: 2
                      }}
                    >
                      <feature.icon
                        sx={{
                          fontSize: '3.5rem',
                          color: '#00D4B8',
                          border: `2px solid #00D4B8`,
                          borderRadius: '16px',
                          p: 2
                        }}
                      />
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 600,
                        fontSize: '1.3rem',
                        color: '#FFFFFF',
                        mb: 2,
                        textAlign: 'center'
                      }}
                    >
                      {feature.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontWeight: 400,
                        fontSize: '0.95rem',
                        color: alpha('#FFFFFF', 0.7),
                        lineHeight: 1.6,
                        textAlign: 'center'
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>

        {/* CTA Strip */}
        <Fade in={isVisible} timeout={1200}>
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              px: { xs: 2, md: 4 },
              backgroundColor: alpha('#0F1E35', 0.6),
              borderRadius: '20px',
              border: `1px solid ${alpha('#00D4B8', 0.2)}`
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 500,
                fontSize: '1.2rem',
                color: '#FFFFFF',
                mb: 3
              }}
            >
              Want early access to these features?
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center',
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              <TextField
                fullWidth
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                sx={{
                  flex: 1,
                  minWidth: { xs: '100%', sm: '300px' },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: alpha('#FFFFFF', 0.1),
                    border: `1px solid ${alpha('#00D4B8', 0.3)}`,
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontFamily: 'DM Sans, sans-serif',
                    '&:hover': {
                      border: `1px solid ${alpha('#00D4B8', 0.5)}`
                    },
                    '&.Mui-focused': {
                      border: `1px solid #00D4B8`,
                      backgroundColor: alpha('#FFFFFF', 0.15)
                    },
                    '& input': {
                      color: '#FFFFFF',
                      '&::placeholder': {
                        color: alpha('#FFFFFF', 0.5)
                      }
                    }
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #00D4B8, #00B894)',
                  color: '#0A1628',
                  fontWeight: 600,
                  fontSize: '1rem',
                  fontFamily: 'DM Sans, sans-serif',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  boxShadow: `0 4px 20px ${alpha('#00D4B8', 0.4)}`,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #00B894, #00A885)',
                    boxShadow: `0 6px 25px ${alpha('#00D4B8', 0.6)}`
                  }
                }}
              >
                Notify Me
              </Button>
            </Box>

            <Typography
              variant="caption"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                color: alpha('#FFFFFF', 0.5),
                mt: 2,
                display: 'block'
              }}
            >
              No spam. We'll only reach out when it's ready.
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
