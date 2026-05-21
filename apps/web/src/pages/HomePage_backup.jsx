import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthProvider.jsx";
import RoadmapSection from "../components/RoadmapSection.jsx";
import HowItWorksStep from "../components/HowItWorksStep.jsx";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  Fade,
  Slide,
  GlobalStyles
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Gavel as GavelIcon,
  VerifiedUser as VerifiedUserIcon,
  Balance as BalanceIcon,
  Shield as ShieldIcon,
  Circle as CircleIcon,
  DescriptionOutlined,
  ArrowForwardOutlined
} from '@mui/icons-material';

// useInView hook for scroll animations
function useInView(threshold = 0.1) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, inView];
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  // Animation states
  const [heroVisible, setHeroVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [counters, setCounters] = useState({
    agreements: 0,
    resolution: 0,
    minutes: 0
  });

  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  // Hero animations on mount
  useEffect(() => {
    setHeroVisible(true);
    
    // Counting animation for stats
    const countersInterval = setInterval(() => {
      setCounters(prev => ({
        agreements: Math.min(prev.agreements + 48, 2400),
        resolution: Math.min(prev.resolution + 2, 98),
        minutes: Math.min(prev.minutes + 1, 2)
      }));
    }, 30);

    return () => clearInterval(countersInterval);
  }, []);

  // Features intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeaturesVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: GavelIcon,
      title: "Agreement Verification",
      description: "Our AI instantly scans your rental agreement and flags hidden clauses, unfair terms, and legal risks — before you sign anything.",
      number: "01"
    },
    {
      icon: VerifiedUserIcon,
      title: "Tenant & Owner Reputation",
      description: "Check who you're dealing with before committing. RentScore profiles give you verified payment history, past disputes, and reliability ratings.",
      number: "02"
    },
    {
      icon: BalanceIcon,
      title: "Legal Assistance",
      description: "Connect with verified legal experts for rental disputes across Delhi, Gurgaon, and Noida. Fast, affordable, and rental-specific.",
      number: "03"
    }
  ];

  const activityFeed = [
    "🔒 Agreement verified — Dwarka, Delhi  · 2m ago",
    "⭐ RentScore updated — Gurgaon  · 5m ago",
    "✅ Lease signed — Noida  · 8m ago"
  ];

  return (
  <>
    {/* GlobalStyles for animations */}
    <GlobalStyles
      styles={{
        '@keyframes fadeSlideUp': {
          from: { opacity: 0, transform: 'translateY(40px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        '@keyframes progressLine': {
          from: { height: '0%' },
          to: { height: '100%' }
        },
        '@keyframes stepPop': {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: 1 }
        },
        '@keyframes glowPulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,212,184,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(0,212,184,0)' }
        }
      }}
    />
    
    {/* HERO SECTION */}
    <Box
      ref={heroRef}
      sx={{
        minHeight: '100vh',
        background: '#0A1628',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {/* Animated background gradients */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(0, 212, 184, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(245, 98, 45, 0.06) 0%, transparent 50%)
          `,
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.7 }
          }
        }}
      />

      {/* Grid overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(0, 212, 184, 0.06) 0px, transparent 1px, transparent 60px, rgba(0, 212, 184, 0.06) 61px),
            repeating-linear-gradient(90deg, rgba(0, 212, 184, 0.06) 0px, transparent 1px, transparent 60px, rgba(0, 212, 184, 0.06) 61px)
          `,
          pointerEvents: 'none'
        }}
      />

      {/* Floating shapes */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 200,
          height: 200,
          background: 'rgba(0, 212, 184, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float1 10s ease-in-out infinite',
          '@keyframes float1': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-30px)' }
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          right: '15%',
          width: 150,
          height: 150,
          background: 'rgba(245, 98, 45, 0.08)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float2 12s ease-in-out infinite',
          '@keyframes float2': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(20px)' }
          }
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Column - Text Content */}
          <Grid item xs={12} md={7}>
            <Fade in={heroVisible} timeout={300}>
              <Chip
                label="🇮🇳 Built for India's Rental Market"
                sx={{
                  mb: 3,
                  backgroundColor: 'transparent',
                  border: '1px solid #00D4B8',
                  color: '#00D4B8',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  fontFamily: 'DM Sans, sans-serif',
                  animation: heroVisible ? 'slideUp 0.6s ease-out 0.3s both' : 'none',
                  '@keyframes slideUp': {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' }
                  }
                }}
              />
            </Fade>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                  mb: 1
                }}
              >
                <Fade in={heroVisible} timeout={500}>
                  <Box component="div" sx={{ display: 'block' }}>
                    Rent Smarter.
                  </Box>
                </Fade>

                <Fade in={heroVisible} timeout={700}>
                  <Box component="div" sx={{ display: 'block', color: '#00D4B8' }}>
                    Trust Deeper.
                  </Box>
                </Fade>

                <Fade in={heroVisible} timeout={900}>
                  <Box component="div" sx={{ display: 'block' }}>
                    Stay Protected.
                  </Box>
                </Fade>
              </Typography>
            </Box>

            <Fade in={heroVisible} timeout={1200}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  color: '#8899AA',
                  maxWidth: '480px',
                  mb: 4,
                  lineHeight: 1.6,
                  animation: heroVisible ? 'slideUp 0.6s ease-out 0.7s both' : 'none'
                }}
              >
                RentShield gives tenants and landlords in Delhi NCR the tools to verify agreements, check reputations, and rent with complete confidence.
              </Typography>
            </Fade>

            <Fade in={heroVisible} timeout={1400}>
              <Box sx={{ 
                display: 'flex', 
                gap: 2, 
                flexWrap: 'wrap',
                animation: heroVisible ? 'slideUp 0.6s ease-out 0.9s both' : 'none'
              }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate("/auth")}
                  sx={{
                    background: '#00D4B8',
                    color: '#0A1628',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: 'DM Sans, sans-serif',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      background: '#00B894'
                    }
                  }}
                >
                  Get Started Free
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate("/auth")}
                  sx={{
                    borderColor: '#00D4B8',
                    color: '#00D4B8',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: 'DM Sans, sans-serif',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#00B894',
                      color: '#00B894'
                    }
                  }}
                >
                  See How It Works
                </Button>
              </Box>
            </Fade>

            <Fade in={heroVisible} timeout={1600}>
              <Box sx={{ 
                display: 'flex', 
                gap: 3, 
                mt: 3,
                flexWrap: 'wrap',
                animation: heroVisible ? 'slideUp 0.6s ease-out 1.1s both' : 'none'
              }}>
                <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif' }}>
                  ✓ No credit card needed
                </Typography>
                <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif' }}>
                  ✓ Free for tenants
                </Typography>
                <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif' }}>
                  ✓ 100% secure
                </Typography>
              </Box>
            </Fade>
          </Grid>

          {/* Right Column - Stats Card */}
          <Grid item xs={12} md={5}>
            <Fade in={heroVisible} timeout={1800}>
              <Card
                sx={{
                  background: 'rgba(17, 34, 68, 0.8)',
                  border: '1px solid rgba(0, 212, 184, 0.2)',
                  borderRadius: 3,
                  backdropFilter: 'blur(12px)',
                  p: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0, 212, 184, 0.2)'
                  }
                }}
              >
                {/* Live indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CircleIcon sx={{ 
                    fontSize: 8, 
                    color: '#F5622D', 
                    mr: 1,
                    animation: 'pulse 2s infinite'
                  }} />
                  <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif' }}>
                    Live Platform
                  </Typography>
                </Box>
    </>
  );

                {/* Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={6}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '2rem',
                        color: '#00D4B8',
                        fontWeight: 700
                      }}
                    >
                      {counters.agreements}+
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif' }}>
                      Agreements Verified
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '2rem',
                        color: '#00D4B8',
                        fontWeight: 700
                      }}
                    >
                      {counters.resolution}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif' }}>
                      Dispute Resolution Rate
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '2rem',
                        color: '#00D4B8',
                        fontWeight: 700
                      }}
                    >
                      Delhi NCR
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif' }}>
                      Currently Serving
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '2rem',
                        color: '#00D4B8',
                        fontWeight: 700
                      }}
                    >
                      &lt; {counters.minutes} min
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif' }}>
                      Agreement Analysis
                    </Typography>
                  </Grid>
                </Grid>

                {/* Activity Feed */}
                <Box>
                  {activityFeed.map((activity, index) => (
                    <Box
                      key={index}
                      sx={{
                        py: 1,
                        pl: 2,
                        borderLeft: '2px solid #00D4B8',
                        mb: 1,
                        opacity: 0,
                        animation: heroVisible ? `slideInRight 0.5s ease-out ${2 + index * 0.2}s both` : 'none',
                        '@keyframes slideInRight': {
                          '0%': { opacity: 0, transform: 'translateX(20px)' },
                          '100%': { opacity: 1, transform: 'translateX(0)' }
                        }
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif', fontSize: '0.75rem' }}>
                        {activity}
                      </Typography>
                    </Box>
                  ))}
                </Box>
            </Fade>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom divider */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          py: 2,
          textAlign: 'center',
          borderTop: '1px solid rgba(0, 212, 184, 0.1)'
        }}
      >
        <Typography variant="caption" sx={{ color: '#8899AA', fontFamily: 'DM Sans, sans-serif' }}>
          Secured with Firebase  |  MUI Powered  |  Delhi NCR Focused
        </Typography>
      </Box>
    </>
  );
    </Box>
    </>
  );

    {/* FEATURES SECTION */}
    <Box
      ref={featuresRef}
      sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 3, md: 6 },
        background: '#F0F4F8',
        position: 'relative',
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(0, 212, 184, 0.04) 0px, rgba(0, 212, 184, 0.04) 2px, transparent 2px, transparent 22px)'
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Chip
            label="Why Choose Us"
            sx={{
              mb: 3,
              backgroundColor: 'transparent',
              borderLeft: '3px solid #00D4B8',
              border: 'none',
              color: '#0A1628',
              fontWeight: 600,
              fontSize: '0.875rem',
              fontFamily: 'DM Sans, sans-serif',
              px: 0
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: '#0A1628',
              mb: 3
            }}
          >
            Everything You Need to Rent with Confidence
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 400,
              fontSize: '1rem',
              color: '#556677',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            From verifying agreements to building your rental reputation — we've got both sides covered.
          </Typography>
        </Box>
    </>
  );

        {/* Feature Cards */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Slide
                in={featuresVisible}
                direction="up"
                timeout={1000 + index * 150}
                style={{ transformOrigin: 'bottom' }}
              >
                <Card
                  sx={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    position: 'relative',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0, 212, 184, 0.15)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, #00D4B8, #0099FF)',
                      borderRadius: '16px 16px 0 0'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Decorative number */}
                    <Typography
                      variant="h1"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '4rem',
                        color: 'rgba(0, 212, 184, 0.08)',
                        fontWeight: 800,
                        lineHeight: 1
                      }}
                    >
                      {feature.number}
                    </Typography>

                    {/* Icon */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                        mt: 2
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: 'rgba(0, 212, 184, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <feature.icon sx={{ fontSize: 28, color: '#00D4B8' }} />
                      </Box>
    </>
  );
                    </Box>
    </>
  );

                    {/* Title */}
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        color: '#0A1628',
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
                        fontSize: '0.875rem',
                        color: '#556677',
                        lineHeight: 1.7,
                        textAlign: 'center',
                        mb: 3
                      }}
                    >
                      {feature.description}
                    </Typography>

                    {/* Learn more link */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography
                        component="a"
                        href="#"
                        sx={{
                          color: '#00D4B8',
                          fontFamily: 'DM Sans, sans-serif',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        Learn more →
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>

        {/* Highlight Banner */}
        <Card
          sx={{
            background: 'linear-gradient(135deg, #0A1628 0%, #0F2040 100%)',
            borderRadius: '16px',
            p: { xs: 4, md: 6 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative shield icon */}
          <ShieldIcon
            sx={{
              position: 'absolute',
              right: -20,
              bottom: -20,
              fontSize: 120,
              color: 'rgba(0, 212, 184, 0.06)',
              transform: 'rotate(-15deg)'
            }}
          />

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: '#FFFFFF',
                  mb: 2
                }}
              >
                Ready to rent without the risk?
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 400,
                  fontSize: '1rem',
                  color: '#8899AA'
                }}
              >
                Join thousands of tenants and landlords already using RentShield.
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                <Button
                  variant="contained"
                  onClick={() => navigate("/auth")}
                  sx={{
                    background: '#00D4B8',
                    color: '#0A1628',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: 'DM Sans, sans-serif',
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      background: '#00B894'
                    }
                  }}
                >
                  Get Started Free
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>

    {/* TRUST SECTION */}
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        px: { xs: 3, md: 6 },
        background: '#ecfeff',
        textAlign: 'center'
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          sx={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: { xs: '1.75rem', md: '2rem' },
            color: '#0A1628',
            mb: 3
          }}
        >
          Built for Indian Rental Challenges
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 400,
            fontSize: '1rem',
            color: '#475569',
            maxWidth: '600px',
            mx: 'auto'
          }}
        >
          From brokerage scams to agreement loopholes, RentShield helps you stay protected and ensures a smooth renting experience.
        </Typography>
