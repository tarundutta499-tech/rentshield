import React, { useState } from 'react';
import { 
  Box, 
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthProvider';
import { db } from '../lib/firebase';
import PersonIcon from '@mui/icons-material/Person';
import ApartmentIcon from '@mui/icons-material/Apartment';

const RoleCard = ({ title, subtitle, onClick, isLoading, icon: Icon }) => {
  const theme = useTheme();
  
  return (
    <Card
      onClick={onClick}
      disabled={isLoading}
      sx={{
        cursor: isLoading ? 'not-allowed' : 'pointer',
        height: '280px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.02),
        opacity: isLoading ? 0.6 : 1,
        '&:hover': isLoading ? {} : {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.05)
        },
        '&:active': {
          transform: 'scale(0.98)'
        },
        p: 3
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Icon sx={{ fontSize: 64, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: '3em' }}>
          {subtitle}
        </Typography>
        {isLoading && <CircularProgress size={24} />}
      </CardContent>
    </Card>
  );
};

export const RoleSelectionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRoleSelection = async (role) => {
    if (!user) {
      console.error('No authenticated user');
      setError('Please log in to continue');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { role });
      navigate('/dashboard');
    } catch (error) {
      console.error('Role selection error:', error);
      setError('Failed to save role. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={6} sx={{ py: 4 }}>
          {/* Header */}
          <Stack spacing={2} sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 900,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              RentShield
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Welcome to RentShield
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
              Choose how you want to continue
            </Typography>
          </Stack>

          {/* Error Message */}
          {error && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'error.main',
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                p: 2,
                borderRadius: 1
              }}
            >
              {error}
            </Typography>
          )}

          {/* Role Selection Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RoleCard 
                title="Tenant"
                subtitle="Manage agreements, verify rentals, and stay protected"
                onClick={() => handleRoleSelection('tenant')}
                isLoading={isLoading}
                icon={PersonIcon}
              />
            </Grid>
            
            <Grid item xs={12}>
              <RoleCard 
                title="Landlord"
                subtitle="Manage properties, agreements, and tenant relationships"
                onClick={() => handleRoleSelection('landlord')}
                isLoading={isLoading}
                icon={ApartmentIcon}
              />
            </Grid>
          </Grid>

          {/* Footer Help */}
          <Typography 
            variant="caption" 
            sx={{ 
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            You can change your role anytime in your profile settings
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};