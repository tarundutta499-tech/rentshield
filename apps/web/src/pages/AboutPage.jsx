import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, Button, Card, CardContent, Grid, Stack, 
  Typography, Container, Chip, GlobalStyles, Divider
} from "@mui/material";
import { useAuth } from "../state/AuthProvider.jsx";
import {
  VisibilityOffOutlined,
  GavelOutlined,
  HelpOutlineOutlined,
  HomeOutlined,
  PersonOutlineOutlined,
  CheckCircleOutlined,
  LockOutlined,
  BalanceOutlined,
  FlagOutlined,
  ShieldOutlined
} from '@mui/icons-material';

// Custom useInView hook for animations
function useInView(threshold = 0.15) {
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

export function AboutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Animation refs
  const [problemRef, problemInView] = useInView();
  const [solutionRef, solutionInView] = useInView();
  const [valuesRef, valuesInView] = useInView();

  const problems = [
    {
      icon: VisibilityOffOutlined,
      number: "01",
      title: "No Visibility",
      description: "Tenants had no way to know if a landlord was fair, returned deposits on time, or maintained the property well."
    },
    {
      icon: GavelOutlined,
      number: "02", 
      title: "No Accountability",
      description: "Landlords had no way to know if a tenant paid rent on time, maintained the property, or had a history of disputes."
    },
    {
      icon: HelpOutlineOutlined,
      number: "03",
      title: "No Trust",
      description: "Both sides were forced to take a leap of faith every time they started a new rental relationship."
    }
  ];

  const values = [
    {
      icon: VisibilityOffOutlined,
      number: "01",
      title: "Transparency",
      description: "Every rental interaction leaves a record. Both landlords and tenants deserve to know who they're dealing with.",
      highlight: "No more hidden histories.",
      gradient: 'linear-gradient(135deg, #00D4B8, #0099FF)'
    },
    {
      icon: BalanceOutlined,
      number: "02",
      title: "Fairness",
      description: "Both landlords and tenants deserve equal access to information and fair treatment in every rental relationship.",
      highlight: "Equal access. Always.",
      gradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)'
    },
    {
      icon: LockOutlined,
      number: "03",
      title: "Privacy",
      description: "We protect your personal data in accordance with India's DPDP Act 2023 and international privacy standards.",
      highlight: "DPDP Act 2023 compliant.",
      gradient: 'linear-gradient(135deg, #7C3AED, #EC4899)'
    },
    {
      icon: FlagOutlined,
      number: "04",
      title: "Built for India",
      description: "Designed specifically for the unique challenges, regulations, and cultural context of the Indian rental market.",
      highlight: "Designed for Delhi NCR.",
      gradient: 'linear-gradient(135deg, #F5622D, #F5A623)'
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Global Styles for animations */}
      <GlobalStyles
        styles={{
          '@keyframes floatY': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-18px)' }
          },
          '@keyframes fadeSlideUp': {
            'from': { opacity: 0, transform: 'translateY(40px)' },
            'to': { opacity: 1, transform: 'translateY(0)' }
          },
          '@keyframes shimmerBorder': {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' }
          },
          '@keyframes pulseGlow': {
            '0%, 100%': { boxShadow: '0 0 20px rgba(0,212,184,0.2)' },
            '50%': { boxShadow: '0 0 40px rgba(0,212,184,0.5)' }
          },
          '@keyframes countUp': {
            'from': { opacity: 0, transform: 'scale(0.5)' },
            'to': { opacity: 1, transform: 'scale(1)' }
          }
        }}
      />

      {/* SECTION 1: HERO */}
      <Box
        sx={{
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          background: '#0A1628',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background orbs */}
        <Box
          sx={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(0,212,184,0.12)',
            top: '10%',
            left: '5%',
            filter: 'blur(80px)',
            animation: 'floatY 9s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(245,98,45,0.1)',
            bottom: '15%',
            right: '8%',
            filter: 'blur(80px)',
            animation: 'floatY 12s ease-in-out infinite'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(245,166,35,0.08)',
            top: '50%',
            left: '50%',
            filter: 'blur(80px)',
            animation: 'floatY 7s ease-in-out infinite'
          }}
        />

        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(0,212,184,0.04) 0px, transparent 1px, transparent 60px, rgba(0,212,184,0.04) 61px),
              repeating-linear-gradient(90deg, rgba(0,212,184,0.04) 0px, transparent 1px, transparent 60px, rgba(0,212,184,0.04) 61px)
            `,
            pointerEvents: 'none'
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            {/* Left Column */}
            <Grid item xs={12} md={7}>
              <Chip
                label="🏠 Our Story"
                sx={{
                  mb: 3,
                  backgroundColor: 'transparent',
                  border: '1px solid #00D4B8',
                  color: '#00D4B8',
                  borderRadius: '20px',
                  px: 2,
                  py: 0.5,
                  fontSize: '13px',
                  fontFamily: 'DM Sans, sans-serif',
                  animation: 'fadeSlideUp 0.4s ease forwards'
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontFamily: 'Syne, serif',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  mb: 3
                }}
              >
                <Box component="span" sx={{ 
                  display: 'block',
                  color: '#FFFFFF',
                  animation: 'fadeSlideUp 0.6s ease 0.2s both'
                }}>
                  We're Building
                </Box>
                <Box component="span" sx={{ 
                  display: 'block',
                  color: '#FFFFFF',
                  animation: 'fadeSlideUp 0.6s ease 0.35s both'
                }}>
                  India's Most
                </Box>
                <Box component="span" sx={{ 
                  display: 'block',
                  color: '#00D4B8',
                  animation: 'fadeSlideUp 0.6s ease 0.5s both'
                }}>
                  Trusted Rental
                </Box>
                <Box component="span" sx={{ 
                  display: 'block',
                  color: '#FFFFFF',
                  animation: 'fadeSlideUp 0.6s ease 0.65s both'
                }}>
                  Platform.
                </Box>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  color: '#8899AA',
                  maxWidth: 500,
                  lineHeight: 1.8,
                  mb: 4,
                  animation: 'fadeSlideUp 0.6s ease 0.8s both'
                }}
              >
                Born out of real frustration with India's opaque rental market — RentShield is building the trust layer that tenants and landlords in Delhi NCR have always needed.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ animation: 'fadeSlideUp 0.6s ease 1s both' }}>
                <Chip
                  label="📍 Delhi NCR, India"
                  sx={{
                    backgroundColor: 'rgba(0,212,184,0.1)',
                    color: '#00D4B8',
                    border: '1px solid rgba(0,212,184,0.3)',
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                />
                <Chip
                  label="🗓 Founded 2026"
                  sx={{
                    backgroundColor: 'rgba(245,166,35,0.1)',
                    color: '#F5A623',
                    border: '1px solid rgba(245,166,35,0.3)',
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                />
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  background: 'rgba(15,32,64,0.9)',
                  border: '1px solid rgba(0,212,184,0.2)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '24px',
                  p: 4,
                  animation: 'floatY 6s ease-in-out infinite'
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: 'Syne, serif',
                    fontSize: '7.5rem',
                    color: 'rgba(0,212,184,0.15)',
                    lineHeight: 0.8
                  }}
                >
                  "
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontStyle: 'italic',
                    fontSize: '1.25rem',
                    color: '#FFFFFF',
                    lineHeight: 1.7,
                    mb: 3
                  }}
                >
                  Why should signing a rental agreement feel like a gamble? It shouldn't.
                </Typography>

                <Divider sx={{ backgroundColor: 'rgba(0,212,184,0.2)', mb: 3 }} />

                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.875rem',
                    color: '#00D4B8'
                  }}
                >
                  — Founder, RentShield
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  <Chip
                    label="2,400+ Agreements"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip
                    label="Delhi NCR"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Chip
                    label="Est. 2026"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.75rem'
                    }}
                  />
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION 2: OUR STORY */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          background: '#F0F4F8',
          position: 'relative',
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,212,184,0.03) 0px, rgba(0,212,184,0.03) 2px, transparent 2px, transparent 22px)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '4px',
                color: '#00D4B8',
                textTransform: 'uppercase',
                mb: 2,
                display: 'block'
              }}
            >
              Chapter 01
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Syne, serif',
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 800,
                color: '#0A1628'
              }}
            >
              A Platform Born From Frustration
            </Typography>
          </Box>

          {/* Timeline */}
          <Box sx={{ position: 'relative', maxWidth: 900, mx: 'auto' }}>
            {/* Center line */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'rgba(0,212,184,0.3)',
                transform: 'translateX(-50%)',
                display: { xs: 'none', md: 'block' }
              }}
            />

            {/* Milestone 1 */}
            <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1, pr: { md: 4 }, textAlign: { xs: 'center', md: 'right' } }}>
                <Card
                  sx={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    p: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Chip
                    label="The Problem"
                    size="small"
                    sx={{
                      background: '#0A1628',
                      color: '#FFFFFF',
                      mb: 2,
                      fontFamily: 'DM Sans, sans-serif'
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.95rem',
                      color: '#374151',
                      lineHeight: 1.7
                    }}
                  >
                    Our founder rented in Delhi NCR and experienced firsthand — deposit disputes, no landlord accountability, tenants with no track record, and zero platform to help either side make informed decisions.
                  </Typography>
                </Card>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  mx: { xs: 0, md: 2 },
                  my: { xs: 2, md: 0 }
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#00D4B8',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 0 0 4px rgba(0,212,184,0.2)'
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, pl: { md: 4 } }} />
            </Box>

            {/* Milestone 2 */}
            <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1, pl: { md: 4 } }} />
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  mx: { xs: 0, md: 2 },
                  my: { xs: 2, md: 0 }
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#00D4B8',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 0 0 4px rgba(0,212,184,0.2)'
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, pl: { md: 4 } }}>
                <Card
                  sx={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    p: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Chip
                    label="The Insight"
                    size="small"
                    sx={{
                      background: '#0A1628',
                      color: '#FFFFFF',
                      mb: 2,
                      fontFamily: 'DM Sans, sans-serif'
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.95rem',
                      color: '#374151',
                      lineHeight: 1.7
                    }}
                  >
                    Just like a credit score reflects financial behavior, rental history should reflect how someone behaves as a landlord or tenant. The idea for a Rental Reputation Score was born.
                  </Typography>
                </Card>
              </Box>
            </Box>

            {/* Milestone 3 */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1, pr: { md: 4 }, textAlign: { xs: 'center', md: 'right' } }}>
                <Card
                  sx={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    p: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                    }
                  }}
                >
                  <Chip
                    label="2026 — RentShield"
                    size="small"
                    sx={{
                      background: '#0A1628',
                      color: '#FFFFFF',
                      mb: 2,
                      fontFamily: 'DM Sans, sans-serif'
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.95rem',
                      color: '#374151',
                      lineHeight: 1.7
                    }}
                  >
                    We launched RentShield with one mission: make every rental relationship in India start with verified information, not blind faith.
                  </Typography>
                </Card>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  mx: { xs: 0, md: 2 },
                  my: { xs: 2, md: 0 }
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#00D4B8',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 0 0 4px rgba(0,212,184,0.2)'
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, pl: { md: 4 } }} />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* SECTION 3: THE PROBLEM WE SOLVE */}
      <Box
        ref={problemRef}
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          background: '#0A1628'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '4px',
                color: '#00D4B8',
                textTransform: 'uppercase',
                mb: 2,
                display: 'block'
              }}
            >
              Chapter 02
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Syne, serif',
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 800,
                color: '#FFFFFF'
              }}
            >
              The Broken Reality of Renting in India
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {problems.map((problem, index) => (
              <Grid item xs={12} md={4} key={problem.title}>
                <Card
                  sx={{
                    background: '#0F2040',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '20px',
                    p: 4,
                    height: '100%',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: 'rgba(0,212,184,0.3)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    },
                    opacity: problemInView ? 1 : 0,
                    transform: problemInView ? 'none' : 'translateY(40px)',
                    animationTransition: `all 0.6s ease ${index * 0.15}s`
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontFamily: 'Syne, serif',
                      fontSize: '4.5rem',
                      color: 'rgba(0,212,184,0.08)',
                      fontWeight: 800,
                      lineHeight: 1,
                      position: 'relative'
                    }}
                  >
                    {problem.number}
                  </Typography>

                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(245,98,45,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3
                    }}
                  >
                    <problem.icon sx={{ fontSize: 28, color: '#F5622D' }} />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Syne, serif',
                      fontSize: '1.25rem',
                      color: '#FFFFFF',
                      mb: 2,
                      fontWeight: 600
                    }}
                  >
                    {problem.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.875rem',
                      color: '#8899AA',
                      lineHeight: 1.8,
                      mb: 2
                    }}
                  >
                    {problem.description}
                  </Typography>

                  <Box
                    sx={{
                      height: '2px',
                      width: 40,
                      background: 'linear-gradient(90deg, #00D4B8, #F5622D)',
                      mt: 2
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* SECTION 4: OUR SOLUTION */}
      <Box
        ref={solutionRef}
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          background: '#F0F4F8'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '4px',
                color: '#00D4B8',
                textTransform: 'uppercase',
                mb: 2,
                display: 'block'
              }}
            >
              Chapter 03
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Syne, serif',
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 800,
                color: '#0A1628'
              }}
            >
              Two Sides. One Platform.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 0 }}>
            {/* Left Card - For Tenants */}
            <Card
              sx={{
                background: 'linear-gradient(145deg, #0A1628 0%, #0F2040 100%)',
                borderRadius: { xs: '24px', md: '24px 0 0 24px' },
                p: 5,
                minHeight: 400,
                flex: 1,
                position: 'relative'
              }}
            >
              <HomeOutlined sx={{ fontSize: 48, color: '#00D4B8', mb: 2 }} />
              
              <Chip
                label="For Tenants"
                size="small"
                sx={{
                  backgroundColor: 'transparent',
                  border: '1px solid #00D4B8',
                  color: '#00D4B8',
                  mb: 3,
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />

              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Syne, serif',
                  fontSize: '1.75rem',
                  color: '#FFFFFF',
                  mb: 3,
                  fontWeight: 700
                }}
              >
                Check Before You Commit
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.75)',
                  lineHeight: 1.7,
                  mb: 3
                }}
              >
                Check a landlord's reputation before moving in. See their payment history, deposit return record, and reviews from past tenants. Make informed decisions. Rent with confidence.
              </Typography>

              <Stack spacing={1} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlined sx={{ fontSize: 16, color: '#00D4B8' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'DM Sans, sans-serif' }}>
                    Landlord reputation score
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlined sx={{ fontSize: 16, color: '#00D4B8' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'DM Sans, sans-serif' }}>
                    Deposit return history
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlined sx={{ fontSize: 16, color: '#00D4B8' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'DM Sans, sans-serif' }}>
                    Verified past tenant reviews
                  </Typography>
                </Box>
              </Stack>

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
                Start Checking →
              </Typography>
            </Card>

            {/* Center Divider */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
              }}
            >
              <Box sx={{ flex: 1, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  my: 2
                }}
              >
                <ShieldOutlined sx={{ fontSize: 20, color: '#0A1628' }} />
              </Box>
              <Box sx={{ flex: 1, width: '1px', background: 'rgba(255,255,255,0.2)' }} />
            </Box>

            {/* Right Card - For Landlords */}
            <Card
              sx={{
                background: 'linear-gradient(145deg, #F5622D 0%, #F5A623 100%)',
                borderRadius: { xs: '24px', md: '0 24px 24px 0' },
                p: 5,
                minHeight: 400,
                flex: 1,
                position: 'relative'
              }}
            >
              <PersonOutlineOutlined sx={{ fontSize: 48, color: '#FFFFFF', mb: 2 }} />
              
              <Chip
                label="For Landlords"
                size="small"
                sx={{
                  backgroundColor: 'transparent',
                  border: '1px solid #FFFFFF',
                  color: '#FFFFFF',
                  mb: 3,
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />

              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Syne, serif',
                  fontSize: '1.75rem',
                  color: '#FFFFFF',
                  mb: 3,
                  fontWeight: 700
                }}
              >
                Find Tenants You Can Trust
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '1rem',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.7,
                  mb: 3
                }}
              >
                Check a tenant's rental history before signing an agreement. See their payment track record, property care history, and reviews from past landlords. Find reliable tenants every time.
              </Typography>

              <Stack spacing={1} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlined sx={{ fontSize: 16, color: '#FFFFFF' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'DM Sans, sans-serif' }}>
                    Tenant payment history
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlined sx={{ fontSize: 16, color: '#FFFFFF' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'DM Sans, sans-serif' }}>
                    Property care record
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleOutlined sx={{ fontSize: 16, color: '#FFFFFF' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontFamily: 'DM Sans, sans-serif' }}>
                    Past landlord reviews
                  </Typography>
                </Box>
              </Stack>

              <Typography
                component="a"
                href="#"
                sx={{
                  color: '#FFFFFF',
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
                Start Verifying →
              </Typography>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* SECTION 5: OUR VALUES */}
      <Box
        ref={valuesRef}
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          background: '#F8FAFC'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.75rem',
                letterSpacing: '4px',
                color: '#00D4B8',
                textTransform: 'uppercase',
                mb: 2,
                display: 'block'
              }}
            >
              Chapter 04
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Syne, serif',
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 800,
                color: '#0A1628'
              }}
            >
              What We Stand For
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} key={value.title}>
                <Card
                  sx={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    p: 4,
                    height: '100%',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 40px rgba(0,212,184,0.12)'
                    },
                    opacity: valuesInView ? 1 : 0,
                    transform: valuesInView ? 'none' : 'translateY(40px)',
                    animationTransition: `all 0.6s ease ${index * 0.15}s`
                  }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontFamily: 'Syne, serif',
                      fontSize: '3rem',
                      color: 'rgba(0,212,184,0.07)',
                      fontWeight: 800,
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      lineHeight: 1
                    }}
                  >
                    {value.number}
                  </Typography>

                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: value.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3
                    }}
                  >
                    <value.icon sx={{ fontSize: 28, color: '#FFFFFF' }} />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: 'Syne, serif',
                      fontSize: '1.25rem',
                      color: '#0A1628',
                      mb: 2,
                      fontWeight: 600
                    }}
                  >
                    {value.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '0.875rem',
                      color: '#556677',
                      lineHeight: 1.7,
                      mb: 3
                    }}
                  >
                    {value.description}
                  </Typography>

                  <Box
                    sx={{
                      pl: 2,
                      borderLeft: '3px solid #00D4B8',
                      py: 1
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'DM Sans, sans-serif',
                        color: '#00D4B8',
                        fontWeight: 500,
                        fontStyle: 'italic'
                      }}
                    >
                      {value.highlight}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* SECTION 6: FOUNDER NOTE */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          background: '#0A1628',
          position: 'relative'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            sx={{
              fontFamily: 'Syne, serif',
              fontSize: '11.25rem',
              color: 'rgba(0,212,184,0.04)',
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              fontWeight: 800,
              lineHeight: 1,
              zIndex: 0
            }}
          >
            2026
          </Typography>

          <Card
            sx={{
              background: 'rgba(15,32,64,0.8)',
              border: '1px solid rgba(0,212,184,0.15)',
              borderRadius: '24px',
              p: 5,
              backdropFilter: 'blur(20px)',
              position: 'relative',
              zIndex: 1,
              animation: 'pulseGlow 4s ease-in-out infinite'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00D4B8, #0A1628)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  mr: 3
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: 'Syne, serif',
                    fontSize: '1.75rem',
                    color: '#FFFFFF',
                    fontWeight: 800
                  }}
                >
                  T
                </Typography>
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#00FF00',
                    border: '2px solid #0A1628'
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'Syne, serif',
                    fontSize: '1.125rem',
                    color: '#FFFFFF',
                    fontWeight: 700
                  }}
                >
                  Founder, RentShield
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.8125rem',
                    color: '#00D4B8'
                  }}
                >
                  📍 Delhi, India · 2026
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="h1"
              sx={{
                fontFamily: 'Syne, serif',
                fontSize: '6rem',
                color: 'rgba(0,212,184,0.2)',
                lineHeight: 0.5,
                mb: 3
              }}
            >
              "
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontStyle: 'italic',
                fontSize: '1.125rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.9,
                mb: 3
              }}
            >
              I built Rental Shield because I lived through the frustration of not knowing who I was dealing with. I lost money, time, and peace of mind. I don't want anyone else to go through that.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontStyle: 'italic',
                fontSize: '1.125rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.9,
                mb: 3
              }}
            >
              Rental Shield is my answer to a broken system. A platform where both landlords and tenants can walk into a rental relationship with eyes wide open — with real information, real history, and real trust.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontStyle: 'italic',
                fontSize: '1.125rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.9,
                mb: 4
              }}
            >
              We are just getting started, but our mission is clear: make renting in India transparent, fair, and stress-free for everyone.
            </Typography>

            <Divider sx={{ backgroundColor: 'rgba(0,212,184,0.15)', mb: 3 }} />

            <Stack direction="row" spacing={3} justifyContent="center">
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8125rem',
                  color: '#00D4B8'
                }}
              >
                🛡 Trust First
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8125rem',
                  color: '#00D4B8'
                }}
              >
                🇮🇳 Made in India
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8125rem',
                  color: '#00D4B8'
                }}
              >
                ⚡ Built with Purpose
              </Typography>
            </Stack>
          </Card>
        </Container>
      </Box>

      {/* SECTION 7: CTA BANNER */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0A1628 0%, #0F2040 60%, #1a0a00 100%)',
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 6 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Top accent line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #00D4B8, #0099FF, #00D4B8)'
          }}
        />

        {/* Floating orbs */}
        <Box
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(0,212,184,0.08)',
            top: '20%',
            right: '10%',
            filter: 'blur(60px)',
            animation: 'floatY 8s ease-in-out infinite'
          }}
        />

        {/* Decorative text */}
        <Typography
          variant="h1"
          sx={{
            fontFamily: 'Syne, serif',
            fontSize: '12.5rem',
            color: 'rgba(255,255,255,0.02)',
            position: 'absolute',
            right: -20,
            bottom: -20,
            fontWeight: 800,
            zIndex: 0
          }}
        >
          RENT
        </Typography>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Chip
              label="Join the Movement"
              sx={{
                backgroundColor: 'transparent',
                border: '1px solid #00D4B8',
                color: '#00D4B8',
                fontFamily: 'DM Sans, sans-serif'
              }}
            />

            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Syne, serif',
                fontSize: { xs: '2rem', md: '3.25rem' },
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.2
              }}
            >
              Rent Smarter.
              <Box component="span" sx={{ color: '#00D4B8', display: 'block' }}>
                Start Today.
              </Box>
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1.125rem',
                color: 'rgba(255,255,255,0.6)',
                maxWidth: 500,
                lineHeight: 1.6
              }}
            >
              Be part of a community building trust into every rental relationship in India.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                onClick={() => navigate("/auth")}
                sx={{
                  background: '#00D4B8',
                  color: '#0A1628',
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: 'DM Sans, sans-serif',
                  px: 5,
                  py: 1.8,
                  borderRadius: '12px',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: '#00B894',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(0,212,184,0.4)'
                  }
                }}
              >
                Get Started Free →
              </Button>

              <Button
                variant="outlined"
                sx={{
                  borderColor: '#00D4B8',
                  color: '#00D4B8',
                  fontWeight: 700,
                  fontSize: '1rem',
                  fontFamily: 'DM Sans, sans-serif',
                  px: 5,
                  py: 1.8,
                  borderRadius: '12px',
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#00B894',
                    color: '#00B894'
                  }
                }}
              >
                Learn How It Works
              </Button>
            </Stack>

            <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8125rem',
                  color: 'rgba(255,255,255,0.4)'
                }}
              >
                ✓ Free to join
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8125rem',
                  color: 'rgba(255,255,255,0.4)'
                }}
              >
                ✓ No credit card
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8125rem',
                  color: 'rgba(255,255,255,0.4)'
                }}
              >
                ✓ Delhi NCR ready
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

    </Box>
  );
}
