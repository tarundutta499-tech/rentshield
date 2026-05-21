import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthProvider.jsx';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Avatar,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Person,
  Phone,
  LocationOn,
  Language,
  CheckCircle
} from '@mui/icons-material';

const INDIAN_CITIES = [
  'Delhi NCR',
  'Noida',
  'Gurugram',
  'Jaipur',
  'Mumbai',
  'Bengaluru',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Chandigarh',
  'Lucknow',
  'Indore',
  'Kochi'
];

export default function CompleteProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: ''
  });

  const [errors, setErrors] = useState({});

  // Initialize form with existing data
  useEffect(() => {
    if (profile) {
      // Strip +91 prefix from phone number for display in form
      let phone = profile.phoneNumber || user?.phoneNumber || profile.phone || '';
      phone = phone.replace(/\D/g, '');
      if (phone.length === 12 && phone.startsWith('91')) {
        phone = phone.slice(2);
      }
      
      setFormData(prev => ({
        name: profile.fullName || profile.displayName || user?.displayName || '',
        phone: phone,
        city: profile.city || ''
      }));
    }
  }, [profile, user]);

  // Calculate completion percentage
  const calculateProgress = () => {
    const required = ['name', 'phone', 'city'];
    const completed = required.filter(field => formData[field]).length;
    return Math.round((completed / required.length) * 100);
  };

  const progress = calculateProgress();

  // Validate phone number (Indian 10-digit)
  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    // Handle +91 prefix: if 12 digits starting with 91, take last 10
    const normalized = cleanPhone.length === 12 && cleanPhone.startsWith('91') 
      ? cleanPhone.slice(2) 
      : cleanPhone;
    return normalized.length === 10 && /^[6-9]/.test(normalized);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhoneChange = (event) => {
    let value = event.target.value;
    // Only allow numbers
    value = value.replace(/\D/g, '');
    
    // Handle +91 prefix: if 12 digits starting with 91, normalize to 10 digits
    if (value.length === 12 && value.startsWith('91')) {
      value = value.slice(2);
    }
    
    // Only allow up to 10 digits
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, phone: value }));
      if (errors.phone) {
        setErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      // Normalize phone number to store with +91 prefix
      const normalizedPhone = `+91${formData.phone}`;
      const updateData = {
        name: formData.name.trim(),
        fullName: formData.name.trim(),
        phone: formData.phone,
        phoneNumber: normalizedPhone,
        city: formData.city.trim(),
        profileCompleted: true,
        updatedAt: serverTimestamp()
      };

      await updateDoc(userRef, updateData);
      
      setSnackbar({
        open: true,
        message: 'Profile completed successfully!',
        severity: 'success'
      });

      // Redirect to role selection after successful completion
      setTimeout(() => {
        navigate('/select-role');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '32px',
                fontWeight: 'bold'
              }}
            >
              {getInitials(formData.name || 'User')}
            </Avatar>
            
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}>
              Welcome to RentShield 👋
            </Typography>
            
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Help us personalize your rental experience
            </Typography>

            {/* Progress Indicator */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Profile Completion
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 'bold' }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 4
                  }
                }}
              />
            </Box>
          </Box>

          <form onSubmit={handleSubmit}>
            {/* Required Fields */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                Required Information
              </Typography>

              {/* Full Name */}
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: '#666' }} />
                }}
              />

              {/* Phone Number */}
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handlePhoneChange}
                error={!!errors.phone}
                helperText={errors.phone || 'Enter 10-digit Indian mobile number'}
                placeholder="9876543210"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: '#666' }} />
                }}
              />

              {/* City */}
              <TextField
                fullWidth
                select
                label="City / Location"
                value={formData.city}
                onChange={handleChange('city')}
                name="city"
                variant="outlined"
                error={!!errors.city}
                helperText={errors.city}
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: '#666' }} />
                }}
              >
                {INDIAN_CITIES.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>

              {/* Placeholder for future role selection */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Your role will be selected after profile completion.
                </Typography>
              </Box>
              </Box>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || progress < 100}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '16px',
                fontWeight: 'bold',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
                '&:disabled': {
                  background: '#e0e0e0',
                  color: '#999'
                }
              }}
            >
              {loading ? (
                <span>Completing Profile...</span>
              ) : (
                <>
                  <CheckCircle sx={{ mr: 1 }} />
                  Complete Profile
                </>
              )}
            </Button>

            {/* Skip for now link */}
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="text"
                onClick={() => navigate('/dashboard')}
                sx={{ color: '#666' }}
              >
                Skip for now
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
