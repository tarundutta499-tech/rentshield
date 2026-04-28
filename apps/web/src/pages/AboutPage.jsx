import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Box, Button, Card, CardContent, Grid, Stack, 
  Typography, Container, Chip
} from "@mui/material";
import { useAuth } from "../state/AuthProvider.jsx";

export function AboutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ overflow: 'hidden' }}>

      {/* SECTION 1: HERO BANNER */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1565C0, #1E3A8A)',
        py: { xs: 8, md: 12 },
        px: { xs: 3, md: 6 },
      }}>
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center">
            
            <Typography variant="h1" sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.1,
            }}>
              About Rental Shield
            </Typography>

            <Typography variant="h5" sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              maxWidth: 600,
              lineHeight: 1.6,
            }}>
              Building trust between landlords and tenants, 
              one rental at a time.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} flexWrap="wrap" justifyContent="center">
              <Chip
                label="Delhi/NCR, India"
                sx={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 2,
                  px: 1
                }}
              />
              <Chip
                label="Founded 2026"
                sx={{
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 2,
                  px: 1
                }}
              />
            </Stack>

          </Stack>
        </Container>
      </Box>

      {/* SECTION 2: OUR STORY */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 800, mb: 6, color: '#1E3A8A'
          }}>
            Our Story
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="body1" sx={{ 
                fontSize: '1.1rem', 
                lineHeight: 1.8, 
                color: '#374151',
                mb: 2
              }}>
                <strong>Rental Shield was born out of real frustration.</strong>
              </Typography>
              
              <Typography variant="body1" sx={{ 
                fontSize: '1.1rem', 
                lineHeight: 1.8, 
                color: '#374151',
                mb: 2
              }}>
                Our founder experienced firsthand the challenges of renting in India 
                disputes over deposits, landlords with no accountability, tenants 
                with no track record, and no platform to help either side make 
                informed decisions.
              </Typography>
              
              <Typography variant="body1" sx={{ 
                fontSize: '1.1rem', 
                lineHeight: 1.8, 
                color: '#374151',
                mb: 2
              }}>
                In 2026, we decided to change that. We built Rental Shield with one 
                simple but powerful idea: what if landlords and tenants could check 
                each other's history before signing an agreement?
              </Typography>
              
              <Typography variant="body1" sx={{ 
                fontSize: '1.1rem', 
                lineHeight: 1.8, 
                color: '#374151'
              }}>
                Just like a credit score tells you about someone's financial behavior, 
                Rental Shield gives you a Rental Reputation a transparent record of 
                how a landlord or tenant has behaved in past rentals.
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Card sx={{
                p: 4,
                background: 'linear-gradient(135deg, #1565C0, #1E3A8A)',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(21,101,192,0.3)' }
              }}>
                <CardContent>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    textAlign: 'center',
                    fontStyle: 'italic',
                    mb: 2
                  }}>
                    "Why should signing a rental agreement feel like a gamble? It shouldn't."
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    textAlign: 'center',
                    opacity: 0.9
                  }}>
                    Founder, Rental Shield
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION 3: THE PROBLEM WE SOLVE */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        px: { xs: 3, md: 6 }, 
        bgcolor: '#F8FAFC' 
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 800, mb: 6, color: '#1E3A8A'
          }}>
            The Problem We Solve
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{
                p: 3, height: '100%', textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }
              }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h2" sx={{ fontSize: '3rem' }}>
                      ?
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#1E3A8A',
                      mb: 2
                    }}>
                      No Visibility
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tenants had no way to know if a landlord was fair, returned 
                      deposits on time, or maintained the property well.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{
                p: 3, height: '100%', textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }
              }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h2" sx={{ fontSize: '3rem' }}>
                      !
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#1E3A8A',
                      mb: 2
                    }}>
                      No Accountability
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Landlords had no way to know if a tenant paid rent on time, 
                      maintained the property, or had a history of disputes.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{
                p: 3, height: '100%', textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }
              }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h2" sx={{ fontSize: '3rem' }}>
                      ?
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#1E3A8A',
                      mb: 2
                    }}>
                      No Trust
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Both sides were forced to take a leap of faith every time 
                      they started a new rental relationship.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION 4: OUR SOLUTION */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 800, mb: 6, color: '#1E3A8A'
          }}>
            Our Solution
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{
                p: 4, height: '100%',
                background: 'linear-gradient(135deg, #1565C0, #1E3A8A)',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(21,101,192,0.3)' }
              }}>
                <CardContent>
                  <Stack spacing={3}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 800, 
                      textAlign: 'center'
                    }}>
                      For Tenants
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.6,
                      textAlign: 'center'
                    }}>
                      Check a landlord's reputation before moving in. See their 
                      payment history, deposit return record, and reviews from 
                      past tenants. Make informed decisions. Rent with confidence.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{
                p: 4, height: '100%',
                background: 'linear-gradient(135deg, #F59E0B, #F97316)',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(249,115,22,0.3)' }
              }}>
                <CardContent>
                  <Stack spacing={3}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 800, 
                      textAlign: 'center'
                    }}>
                      For Landlords
                    </Typography>
                    <Typography variant="body1" sx={{ 
                      lineHeight: 1.6,
                      textAlign: 'center'
                    }}>
                      Check a tenant's rental history before signing an agreement. 
                      See their payment track record, property care history, and 
                      reviews from past landlords. Find reliable tenants every time.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION 5: OUR VALUES */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        px: { xs: 3, md: 6 }, 
        bgcolor: '#0F172A' 
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 800, mb: 6, color: 'white'
          }}>
            What We Stand For
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                p: 3, height: '100%', textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }
              }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h3" sx={{ fontSize: '2.5rem' }}>
                      ?
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      mb: 2
                    }}>
                      Transparency
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 1.5
                    }}>
                      Every rental interaction leaves a record. 
                      No more hidden histories.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                p: 3, height: '100%', textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }
              }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h3" sx={{ fontSize: '2.5rem' }}>
                      ?
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      mb: 2
                    }}>
                      Fairness
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 1.5
                    }}>
                      Both landlords and tenants deserve equal 
                      access to information.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                p: 3, height: '100%', textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }
              }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h3" sx={{ fontSize: '2.5rem' }}>
                      ?
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      mb: 2
                    }}>
                      Privacy
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 1.5
                    }}>
                      We protect your personal data in accordance 
                      with India's DPDP Act 2023.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                p: 3, height: '100%', textAlign: 'center',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-6px)', 
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }
              }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Typography variant="h3" sx={{ fontSize: '2.5rem' }}>
                      ?
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      mb: 2
                    }}>
                      Built for India
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 1.5
                    }}>
                      Designed specifically for the unique 
                      challenges of the Indian rental market.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION 6: FOUNDER NOTE */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 6 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" sx={{
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 800, mb: 6, color: '#1E3A8A'
          }}>
            A Note from Our Founder
          </Typography>
          
          <Box sx={{ maxWidth: 700, mx: 'auto' }}>
            <Card sx={{
              p: 4,
              background: 'linear-gradient(135deg, rgba(21,101,192,0.05), rgba(30,58,138,0.1))',
              border: '1px solid rgba(21,101,192,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': { transform: 'translateY(-6px)', 
                boxShadow: '0 12px 30px rgba(21,101,192,0.2)' }
            }}>
              <CardContent>
                <Stack spacing={3} alignItems="center" textAlign="center">
                  <Typography variant="h1" sx={{ 
                    fontSize: '4rem', 
                    color: '#1565C0',
                    opacity: 0.3,
                    lineHeight: 1
                  }}>
                    "
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    fontSize: '1.1rem', 
                    lineHeight: 1.8, 
                    color: '#374151',
                    fontStyle: 'italic'
                  }}>
                    I built Rental Shield because I lived through the frustration of 
                    not knowing who I was dealing with. I lost money, time, and peace 
                    of mind. I don't want anyone else to go through that.
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    fontSize: '1.1rem', 
                    lineHeight: 1.8, 
                    color: '#374151',
                    fontStyle: 'italic'
                  }}>
                    Rental Shield is my answer to a broken system. A platform where 
                    both landlords and tenants can walk into a rental relationship 
                    with eyes wide open with real information, real history, and 
                    real trust.
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    fontSize: '1.1rem', 
                    lineHeight: 1.8, 
                    color: '#374151',
                    fontStyle: 'italic'
                  }}>
                    We are just getting started, but our mission is clear: make 
                    renting in India transparent, fair, and stress-free for everyone.
                  </Typography>
                  
                  <Typography variant="h6" sx={{ 
                    fontWeight: 700, 
                    color: '#1E3A8A',
                    mt: 3
                  }}>
                    Founder, Rental Shield | Delhi, 2026
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* SECTION 7: CTA BANNER */}
      <Box sx={{
        background: 'linear-gradient(135deg, #F59E0B, #F97316)',
        py: { xs: 8, md: 12 }, 
        px: { xs: 3, md: 6 }
      }}>
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h3" sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 800, color: 'white'
            }}>
              Join the Rental Revolution
            </Typography>
            <Typography variant="h6" sx={{
              color: 'rgba(255,255,255,0.9)', maxWidth: 600
            }}>
              Be part of a community that believes in transparency and trust.
            </Typography>
            <Button
              variant="contained" size="large"
              onClick={() => navigate("/auth")}
              sx={{
                px: 6, py: 2, fontSize: '1.2rem', fontWeight: 700,
                backgroundColor: 'white', color: '#F59E0B',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.2)' }
              }}
            >
              Get Started Free
            </Button>
          </Stack>
        </Container>
      </Box>

    </Box>
  );
}
