import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthProvider.jsx';
import { auth, db, storage } from '../lib/firebase.js';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

// Privacy masking helper functions
const maskName = (fullName, email) => {
  if (fullName) {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return parts[0] + ' ' + parts[parts.length - 1][0] + '.';
    }
    return parts[0];
  }
  // If no display name, use email prefix
  if (email) {
    const prefix = email.split('@')[0];
    return prefix.length > 3 ? prefix.substring(0, 3) + '***' : prefix;
  }
  return 'Anonymous';
};

const maskLocation = (address, city) => {
  return city || 'Location not specified';
};

const getMemberSinceYear = (createdAt) => {
  if (!createdAt) return 'Unknown';
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  return date.getFullYear();
};
import {
  Box, Card, CardContent, Stack,
  Typography, Container, LinearProgress,
  CircularProgress, Avatar, Chip
} from '@mui/material';
import {
  Person, Star
} from '@mui/icons-material';

export function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      
      try {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        }

        // Fetch all rentals where user was rated
        const landlordRatingsQuery = await getDocs(
          query(collection(db, 'rentals'), 
            where('landlordId', '==', userId),
            where('tenantRating', '!=', null)
          )
        );

        const tenantRatingsQuery = await getDocs(
          query(collection(db, 'rentals'), 
            where('tenantId', '==', userId),
            where('landlordRating', '!=', null)
          )
        );

        // Extract relevant ratings
        const allRatings = [
          ...landlordRatingsQuery.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            rating: doc.data().tenantRating,
            ratedAs: 'landlord',
            propertyAddress: doc.data().propertyAddress,
            startDate: doc.data().startDate
          })),
          ...tenantRatingsQuery.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            rating: doc.data().landlordRating,
            ratedAs: 'tenant',
            propertyAddress: doc.data().propertyAddress,
            startDate: doc.data().startDate
          }))
        ].sort((a, b) => b.rating.submittedAt - a.rating.submittedAt);

        setRatings(allRatings);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const getScoreBadge = (score) => {
    if (!score) return { 
      label: 'No Rating Yet', color: '#9E9E9E' };
    if (score >= 90) return { 
      label: '\ud83e\udd47 Excellent', color: '#0F9D58' };
    if (score >= 75) return { 
      label: '\ud83e\udd48 Good', color: '#1565C0' };
    if (score >= 60) return { 
      label: '\ud83e\udd49 Average', color: '#F59E0B' };
    return { 
      label: '\u26a0\ufe0f Needs Improvement', 
      color: '#DC2626' };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h6" color="error">
          User not found
        </Typography>
      </Container>
    );
  }

  const scoreBadge = getScoreBadge(profile.rentScore);

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
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'white',
              fontSize: 32,
              color: '#1565C0'
            }}>
              <Person />
            </Avatar>
            
            <Typography variant="h3" sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 800,
              color: 'white',
            }}>
              {maskName(profile.displayName, profile.email)}
            </Typography>
            
            <Chip
              label={profile.role || 'User'}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600
              }}
            />
            
            <Typography variant="h2" sx={{ 
              fontSize: { xs: '4rem', md: '6rem' }, 
              fontWeight: 900,
              color: 'white'
            }}>
              {profile.rentScore || 'N/A'}
            </Typography>
            
            <Chip
              label={scoreBadge.label}
              sx={{
                backgroundColor: scoreBadge.color,
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem'
              }}
            />
            
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Based on {profile.totalReviews || 0} ratings
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Member since {getMemberSinceYear(profile.createdAt)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {maskLocation(null, profile.city)}
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          {/* SCORE BREAKDOWN CARD */}
          {profile.rentScore && (
            <Card sx={{ p: 4 }}>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                    Score Breakdown
                  </Typography>
                  
                  <Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Overall RentScore
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                        {profile.rentScore}/100
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={profile.rentScore}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: '#E0E0E0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#1565C0',
                          borderRadius: 6
                        }
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Score calculated from verified rental relationships only
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* RECENT RATINGS SECTION */}
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, color: '#1E3A8A' }}>
              Recent Ratings
            </Typography>
            
            {ratings.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    This user has no ratings yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ratings are only given by verified landlords and tenants.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Stack spacing={3}>
                {ratings.map((ratingData) => (
                  <Card 
                    key={ratingData.id}
                    sx={{ 
                      p: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-6px)', 
                        boxShadow: '0 12px 30px rgba(0,0,0,0.12)' 
                      }
                    }}
                  >
                    <CardContent>
                      <Stack spacing={3}>
                        {/* Header */}
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              \ud83c\udfe0 {ratingData.propertyAddress}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {ratingData.startDate} - {ratingData.ratedAs === 'landlord' ? 'Rated as Landlord' : 'Rated as Tenant'}
                            </Typography>
                          </Box>
                          <Chip 
                            label={`Overall: ${ratingData.rating.weightedScore}/100`}
                            sx={{ backgroundColor: '#F59E0B', color: 'white' }}
                          />
                        </Stack>

                        {/* Star Ratings */}
                        <Stack spacing={2}>
                          {ratingData.ratedAs === 'landlord' ? (
                            <>
                              {/* Tenant rated by landlord */}
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                  \ud83d\udcb0 Payment
                                </Typography>
                                <StarDisplay rating={ratingData.rating.cat1Rating} />
                              </Stack>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                  \ud83c\udfe0 Property Care
                                </Typography>
                                <StarDisplay rating={ratingData.rating.cat2Rating} />
                              </Stack>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                  \ud83d\udcac Communication
                                </Typography>
                                <StarDisplay rating={ratingData.rating.cat3Rating} />
                              </Stack>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                  \ud83d\udccb Lease Compliance
                                </Typography>
                                <StarDisplay rating={ratingData.rating.cat4Rating} />
                              </Stack>
                            </>
                          ) : (
                            <>
                              {/* Landlord rated by tenant */}
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                  \ud83d\udcb0 Deposit
                                </Typography>
                                <StarDisplay rating={ratingData.rating.cat1Rating} />
                              </Stack>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                  \ud83c\udfe0 Property Quality
                                </Typography>
                                <StarDisplay rating={ratingData.rating.cat2Rating} />
                              </Stack>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                  \ud83d\udcac Communication
                                </Typography>
                                <StarDisplay rating={ratingData.rating.cat3Rating} />
                              </Stack>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="body2" sx={{ minWidth: 120 }}>
                                  \ud83d\udd27 Maintenance
                                </Typography>
                                <StarDisplay rating={ratingData.rating.cat4Rating} />
                              </Stack>
                            </>
                          )}
                        </Stack>

                        {/* Comment */}
                        {ratingData.rating.comment && (
                          <Box sx={{ 
                            p: 2, 
                            backgroundColor: '#F5F5F5', 
                            borderRadius: 2 
                          }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              "{ratingData.rating.comment}"
                            </Typography>
                          </Box>
                        )}

                        {/* Date */}
                        <Typography variant="caption" color="text.secondary">
                          Rated on: {formatDate(ratingData.rating.submittedAt)}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>

          {/* PRIVACY NOTICE BANNER */}
          <Card sx={{ 
            p: 3, 
            backgroundColor: '#F5F5F5',
            border: '1px solid #E0E0E0'
          }}>
            <CardContent sx={{ p: 0 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                  &#128274; Personal details are protected. Only verified rental history and scores are shown publicly.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
