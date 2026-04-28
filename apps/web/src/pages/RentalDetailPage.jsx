import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthProvider.jsx';
import { auth, db, storage } from '../lib/firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import {
  Box, Button, Card, CardContent, Grid,
  Stack, Typography, Container, Chip,
  CircularProgress, Divider, Avatar
} from '@mui/material';
import {
  ArrowBack, Home, AttachMoney,
  CalendarToday, Star, Person
} from '@mui/icons-material';

export function RentalDetailPage() {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRental = async () => {
      if (!rentalId) return;

      try {
        const rentalDoc = await getDoc(doc(db, 'rentals', rentalId));

        if (rentalDoc.exists()) {
          const rentalData = rentalDoc.data();
          
          // Verify user is landlordId or tenantId
          if (user.uid !== rentalData.landlordId && 
              user.uid !== rentalData.tenantId) {
            console.log("Access denied - user not part of this rental");
            setTimeout(() => navigate('/dashboard'), 2000);
            return;
          }

          setRental(rentalData);
        } else {
          console.log("Rental not found");
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (err) {
        console.error("Error fetching rental:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRental();
  }, [rentalId, user.uid, navigate]);

  const StarDisplay = ({ rating }) => {
    return (
      <Stack direction="row" spacing={0.5}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            sx={{
              fontSize: 16,
              color: star <= rating ? '#F59E0B' : '#E0E0E0'
            }}
          />
        ))}
      </Stack>
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not specified";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!rental) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h6" color="error">
          Rental not found or access denied
        </Typography>
        <Button onClick={() => navigate('/dashboard')} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const isLandlord = rental.landlordId === user.uid;

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* HERO BANNER */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1565C0, #1E3A8A)',
        py: { xs: 6, md: 8 },
        px: { xs: 3, md: 6 },
      }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ color: 'white', alignSelf: 'flex-start' }}
            >
              Back
            </Button>
            <Typography variant="h3" sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 800,
              color: 'white',
            }}>
              Rental Details
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {rental.propertyAddress}
            </Typography>
            <Chip
              label={
                rental.status === 'active' ? '\ud83d\udfe2 Active' :
                rental.status === 'pending' ? '\u23f1\ufe0f Pending' :
                '\u274c Ended'
              }
              sx={{
                backgroundColor: 
                  rental.status === 'active' ? '#4CAF50' :
                  rental.status === 'pending' ? '#F59E0B' :
                  '#F44336',
                color: 'white',
                fontWeight: 600
              }}
            />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Grid container spacing={4}>
          {/* LEFT COLUMN - PROPERTY DETAILS */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              p: 4,
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-6px)', 
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)' 
              }
            }}>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                    Property Details
                  </Typography>
                  
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Home sx={{ color: '#1565C0' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Full Address
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rental.propertyAddress}, {rental.propertyCity}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <AttachMoney sx={{ color: '#1565C0' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Monthly Rent
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          \u20b9{rental.rentAmount}/month
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <CalendarToday sx={{ color: '#1565C0' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Start Date
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rental.startDate}
                        </Typography>
                      </Box>
                    </Stack>

                    {rental.endedAt && (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <CalendarToday sx={{ color: '#1565C0' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            End Date
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(rental.endedAt)}
                          </Typography>
                        </Box>
                      </Stack>
                    )}

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Status
                      </Typography>
                      <Chip
                        label={
                          rental.status === 'active' ? 'Active' :
                          rental.status === 'pending' ? 'Pending' :
                          'Ended'
                        }
                        sx={{
                          backgroundColor: 
                            rental.status === 'active' ? '#4CAF50' :
                            rental.status === 'pending' ? '#F59E0B' :
                            '#F44336',
                          color: 'white'
                        }}
                      />
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT COLUMN - PEOPLE */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              p: 4,
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-6px)', 
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)' 
              }
            }}>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                    People
                  </Typography>
                  
                  {/* Landlord Section */}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Landlord
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#1565C0' }}>
                        <Person />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {rental.landlordName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rental.landlordEmail}
                        </Typography>
                      </Box>
                      <Chip
                        label="Landlord"
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(21,101,192,0.1)',
                          color: '#1565C0',
                          fontWeight: 600
                        }}
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Tenant Section */}
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Tenant
                    </Typography>
                    {rental.status === 'pending' ? (
                      <Typography variant="body2" color="text.secondary">
                        Pending acceptance
                      </Typography>
                    ) : (
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: '#1565C0' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {rental.tenantName || 'Not specified'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {rental.tenantEmail || rental.tenantEmail}
                          </Typography>
                        </Box>
                        <Chip
                          label="Tenant"
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(21,101,192,0.1)',
                            color: '#1565C0',
                            fontWeight: 600
                          }}
                        />
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* RATINGS SECTION - FULL WIDTH */}
          <Grid item xs={12}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#1E3A8A' }}>
              Ratings
            </Typography>
            
            <Grid container spacing={3}>
              {/* LANDLORD'S RATING OF TENANT */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-6px)', 
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)' 
                  }
                }}>
                  <CardContent>
                    <Stack spacing={3}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Landlord's Rating of Tenant
                      </Typography>
                      
                      {rental.landlordRating ? (
                        <Stack spacing={2}>
                          {/* Payment Rating */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <AttachMoney sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                              Payment
                            </Typography>
                            <StarDisplay rating={rental.landlordRating.cat1Rating} />
                          </Stack>

                          {/* Property Rating */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Home sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                              Property Care
                            </Typography>
                            <StarDisplay rating={rental.landlordRating.cat2Rating} />
                          </Stack>

                          {/* Communication Rating */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Star sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                              Communication
                            </Typography>
                            <StarDisplay rating={rental.landlordRating.cat3Rating} />
                          </Stack>

                          {/* Compliance Rating */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <CalendarToday sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                              Lease Compliance
                            </Typography>
                            <StarDisplay rating={rental.landlordRating.cat4Rating} />
                          </Stack>

                          <Divider />

                          <Chip 
                            label={`Overall: ${rental.landlordRating.weightedScore}/100`}
                            sx={{ backgroundColor: '#F59E0B', color: 'white' }}
                          />

                          {rental.landlordRating.comment && (
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              "{rental.landlordRating.comment}"
                            </Typography>
                          )}

                          <Typography variant="caption" color="text.secondary">
                            Submitted: {formatDate(rental.landlordRating.submittedAt)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Stack spacing={2}>
                          <Typography variant="body2" color="text.secondary">
                            Landlord hasn't rated yet
                          </Typography>
                          {isLandlord && rental.status !== 'ended' && (
                            <Button
                              variant="contained"
                              onClick={() => navigate(`/rate/${rental.id}`)}
                              sx={{
                                backgroundColor: '#1565C0',
                                '&:hover': { backgroundColor: '#1E3A8A' }
                              }}
                            >
                              Rate Now
                            </Button>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* TENANT'S RATING OF LANDLORD */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-6px)', 
                    boxShadow: '0 12px 30px rgba(0,0,0,0.12)' 
                  }
                }}>
                  <CardContent>
                    <Stack spacing={3}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Tenant's Rating of Landlord
                      </Typography>
                      
                      {rental.tenantRating ? (
                        <Stack spacing={2}>
                          {/* Deposit Rating */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <AttachMoney sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                              Deposit
                            </Typography>
                            <StarDisplay rating={rental.tenantRating.cat1Rating} />
                          </Stack>

                          {/* Property Rating */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Home sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                              Property Quality
                            </Typography>
                            <StarDisplay rating={rental.tenantRating.cat2Rating} />
                          </Stack>

                          {/* Communication Rating */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Star sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                              Communication
                            </Typography>
                            <StarDisplay rating={rental.tenantRating.cat3Rating} />
                          </Stack>

                          {/* Maintenance Rating */}
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Build sx={{ fontSize: 16, color: '#666' }} />
                            <Typography variant="body2" sx={{ minWidth: 100 }}>
                              Maintenance
                            </Typography>
                            <StarDisplay rating={rental.tenantRating.cat4Rating} />
                          </Stack>

                          <Divider />

                          <Chip 
                            label={`Overall: ${rental.tenantRating.weightedScore}/100`}
                            sx={{ backgroundColor: '#F59E0B', color: 'white' }}
                          />

                          {rental.tenantRating.comment && (
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              "{rental.tenantRating.comment}"
                            </Typography>
                          )}

                          <Typography variant="caption" color="text.secondary">
                            Submitted: {formatDate(rental.tenantRating.submittedAt)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Stack spacing={2}>
                          <Typography variant="body2" color="text.secondary">
                            Tenant hasn't rated yet
                          </Typography>
                          {!isLandlord && rental.status !== 'ended' && (
                            <Button
                              variant="contained"
                              onClick={() => navigate(`/rate/${rental.id}`)}
                              sx={{
                                backgroundColor: '#1565C0',
                                '&:hover': { backgroundColor: '#1E3A8A' }
                              }}
                            >
                              Rate Now
                            </Button>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
