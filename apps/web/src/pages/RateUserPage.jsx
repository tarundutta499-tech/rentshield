import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthProvider.jsx';
import { auth, db, storage } from '../lib/firebase.js';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import {
  Box, Button, Card, CardContent, Stack,
  Typography, Container, Alert,
  CircularProgress, Chip, LinearProgress
} from '@mui/material';
import {
  Star, ArrowBack, CheckCircle,
  Home, AttachMoney, Message,
  Description, Build
} from '@mui/icons-material';

export function RateUserPage() {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState({
    cat1: 0, cat2: 0, cat3: 0, cat4: 0
  });
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchRental = async () => {
      if (!rentalId) return;

      try {
        const rentalDoc = await getDoc(doc(db, 'rentals', rentalId));

        if (rentalDoc.exists()) {
          const rentalData = rentalDoc.data();
          
          // Check user is either landlordId or tenantId
          if (user.uid !== rentalData.landlordId && 
              user.uid !== rentalData.tenantId) {
            setError("You don't have permission to rate for this rental");
            setTimeout(() => navigate('/dashboard'), 2000);
            return;
          }

          setRental(rentalData);

          // If already rated, pre-fill ratings
          const isLandlord = rentalData.landlordId === user.uid;
          const existingRating = isLandlord ? rentalData.landlordRating : rentalData.tenantRating;
          
          if (existingRating) {
            setRatings({
              cat1: existingRating.cat1Rating || 0,
              cat2: existingRating.cat2Rating || 0,
              cat3: existingRating.cat3Rating || 0,
              cat4: existingRating.cat4Rating || 0
            });
            setComment(existingRating.comment || "");
          }
        } else {
          setError("Rental not found");
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (err) {
        setError("Failed to load rental information");
        console.error("Error fetching rental:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRental();
  }, [rentalId, user, navigate]);

  // Determine rating categories based on user role
  const isLandlord = rental?.landlordId === user.uid;
  const categories = isLandlord ? [
    { 
      key: 'cat1', 
      label: "Payment", 
      question: "Did they pay rent on time?",
      weight: "40%",
      icon: <AttachMoney />
    },
    { 
      key: 'cat2', 
      label: "Property Care",
      question: "Did they maintain the property?",
      weight: "25%",
      icon: <Home />
    },
    { 
      key: 'cat3', 
      label: "Communication",
      question: "Were they responsive & respectful?",
      weight: "20%",
      icon: <Message />
    },
    { 
      key: 'cat4', 
      label: "Lease Compliance",
      question: "Did they follow lease terms?",
      weight: "15%",
      icon: <Description />
    }
  ] : [
    { 
      key: 'cat1', 
      label: "Deposit",
      question: "Did they return deposit on time?",
      weight: "40%",
      icon: <AttachMoney />
    },
    { 
      key: 'cat2', 
      label: "Property Quality",
      question: "Was property as described?",
      weight: "25%",
      icon: <Home />
    },
    { 
      key: 'cat3', 
      label: "Communication",
      question: "Were they responsive & respectful?",
      weight: "20%",
      icon: <Message />
    },
    { 
      key: 'cat4', 
      label: "Maintenance",
      question: "Did they fix issues promptly?",
      weight: "15%",
      icon: <Build />
    }
  ];

  const StarRating = ({ value, onChange, disabled }) => (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star}
          onClick={() => !disabled && onChange(star)}
          sx={{
            fontSize: 40,
            cursor: disabled ? 'default' : 'pointer',
            color: star <= value ? '#F59E0B' : '#E0E0E0',
            transition: 'all 0.2s ease',
            '&:hover': disabled ? {} : { 
              color: '#F59E0B',
              transform: 'scale(1.2)' 
            }
          }}
        />
      ))}
    </Box>
  );

  const onSubmit = async () => {
    if (Object.values(ratings).some(r => r === 0)) {
      setError("Please rate all 4 categories");
      return;
    }

    setSubmitting(true);
    try {
      const weightedScore = Math.round(
        (ratings.cat1 * 0.40 +
         ratings.cat2 * 0.25 +
         ratings.cat3 * 0.20 +
         ratings.cat4 * 0.15) * 20
      );

      const ratingData = {
        cat1Rating: ratings.cat1,
        cat2Rating: ratings.cat2,
        cat3Rating: ratings.cat3,
        cat4Rating: ratings.cat4,
        weightedScore,
        comment: comment.trim(),
        submittedAt: serverTimestamp()
      };

      const ratingField = isLandlord ? 'landlordRating' : 'tenantRating';
      const ratedUserId = isLandlord ? rental.tenantId : rental.landlordId;

      // Save rating to rental document
      await updateDoc(doc(db, 'rentals', rental.id), { [ratingField]: ratingData });

      // Recalculate RentScore for rated user
      // Fetch ALL rentals where this user was rated (as tenant or landlord)
      const asLandlordRentals = await getDocs(
        query(collection(db, 'rentals'), 
          where('landlordId', '==', ratedUserId),
          where('tenantRating', '!=', null)
        )
      );

      const asTenantRentals = await getDocs(
        query(collection(db, 'rentals'), 
          where('tenantId', '==', ratedUserId),
          where('landlordRating', '!=', null)
        )
      );

      // Combine and calculate new average
      const allRatings = [
        ...asLandlordRentals.docs.map(doc => ({
          rating: doc.data().tenantRating,
          weightedScore: doc.data().tenantRating?.weightedScore || 0
        })),
        ...asTenantRentals.docs.map(doc => ({
          rating: doc.data().landlordRating,
          weightedScore: doc.data().landlordRating?.weightedScore || 0
        }))
      ];

      const avgScore = allRatings.length > 0
        ? Math.round(
            allRatings.reduce((sum, r) => sum + r.weightedScore, 0) /
            allRatings.length
          )
        : 600;

      if (allRatings.length > 0) {
        await updateDoc(doc(db, 'users', ratedUserId), {
          rentScore: avgScore,
          totalReviews: allRatings.length,
          lastScoreUpdate: serverTimestamp()
        });
      }

      // Send notification to rated user
      await addDoc(collection(db, 'notifications'), {
        userId: ratedUserId,
        type: "rating_received",
        title: "New Rating Received",
        message: "You received a rating of " + avgScore +
          "/100 for " + rental.propertyAddress,
        rentalId: rental.id,
        read: false,
        createdAt: serverTimestamp()
      });

      setSubmitted(true);
    } catch (e) {
      setError(e.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
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

  if (error && !submitted) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CheckCircle sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1E3A8A' }}>
            Rating Submitted! \u2b50
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
            Your rating has been saved and their RentScore has been updated.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
            sx={{
              px: 4,
              backgroundColor: '#1565C0',
              '&:hover': { backgroundColor: '#1E3A8A' }
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  const existingRating = isLandlord ? rental.landlordRating : rental.tenantRating;
  const personBeingRated = isLandlord 
    ? { name: rental.tenantName, email: rental.tenantEmail, role: 'Tenant' }
    : { name: rental.landlordName, email: rental.landlordEmail, role: 'Landlord' };

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
              Rate Your {isLandlord ? 'Tenant' : 'Landlord'}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {rental.propertyAddress}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Rating: {personBeingRated.name}
              </Typography>
              <Chip
                label={personBeingRated.role}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          {/* PROPERTY INFO CARD */}
          <Card sx={{ p: 4, backgroundColor: '#F5F5F5' }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Property Information
                </Typography>
                <Stack direction="row" spacing={3}>
                  <Typography variant="body2">
                    <strong>\ud83c\udfe0 Property:</strong> {rental.propertyAddress}, {rental.propertyCity}
                  </Typography>
                  <Typography variant="body2">
                    <strong>\ud83d\udcb0 Rent:</strong> \u20b9{rental.rentAmount}/month
                  </Typography>
                  <Typography variant="body2">
                    <strong>\ud83d\udcc5 Start Date:</strong> {rental.startDate}
                  </Typography>
                </Stack>
                <Chip 
                  label={rental.status === 'active' ? '\ud83d\udfe2 Active' : '\u23f1\ufe0f Pending'}
                  size="small"
                  sx={{ 
                    backgroundColor: rental.status === 'active' ? '#4CAF50' : '#F59E0B',
                    color: 'white'
                  }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* EXISTING RATING BANNER */}
          {existingRating && (
            <Alert severity="success">
              \u2705 You already submitted a rating. You can update it below while rental is active.
            </Alert>
          )}

          {/* CATEGORY RATING CARDS */}
          {categories.map((category) => (
            <Card 
              key={category.key}
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
                <Stack spacing={3} alignItems="center" textAlign="center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    {category.icon}
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                      {category.label}
                    </Typography>
                    <Chip 
                      label={category.weight}
                      size="small"
                      sx={{ backgroundColor: '#F59E0B', color: 'white' }}
                    />
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {category.question}
                  </Typography>
                  
                  <StarRating 
                    value={ratings[category.key]} 
                    onChange={(star) => setRatings(prev => ({ ...prev, [category.key]: star }))}
                    disabled={rental.status === 'ended'}
                  />
                  
                  {ratings[category.key] > 0 && (
                    <Typography variant="body2" color="#F59E0B" sx={{ fontWeight: 600 }}>
                      You rated: {ratings[category.key]}/5 stars
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}

          {/* COMMENT FIELD */}
          <Card sx={{ p: 4 }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Share Your Experience
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Share your experience (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  helperText={`${comment.length}/500 characters`}
                  inputProps={{ maxLength: 500 }}
                  disabled={rental.status === 'ended'}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* SUBMIT BUTTON */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={onSubmit}
            disabled={submitting || rental.status === 'ended' || Object.values(ratings).some(r => r === 0)}
            sx={{
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              backgroundColor: '#1565C0',
              '&:hover': { backgroundColor: '#1E3A8A' },
              '&:disabled': { backgroundColor: '#ccc' }
            }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : 
             existingRating ? 'Update Rating' : 'Submit Rating'}
          </Button>

          {rental.status === 'ended' && (
            <Alert severity="info">
              This rental has ended and ratings are now locked.
            </Alert>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
