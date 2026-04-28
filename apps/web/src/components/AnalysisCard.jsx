import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  Error,
  CheckCircle,
  Lightbulb,
  Visibility
} from '@mui/icons-material';

export default function AnalysisCard({ agreement, onReviewClick, analysis: externalAnalysis }) {
  const [analysis, setAnalysis] = useState(externalAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Use external analysis if provided, otherwise analyze
  React.useEffect(() => {
    if (externalAnalysis) {
      setAnalysis(externalAnalysis);
      console.log("DEBUG: Using external analysis data:", externalAnalysis);
    } else if (agreement?.text && !analysis && !loading) {
      analyzeAgreement();
    }
  }, [agreement, externalAnalysis, analysis, loading]);

  const analyzeAgreement = async () => {
    if (!agreement?.text) return;

    console.log("DEBUG: Starting agreement analysis");
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return deterministic mock data
      const result = {
        score: 70,
        risk: "Medium",
        issues: [
          {
            title: "Missing Security Deposit Clause",
            problem: "No deposit terms mentioned",
            impact: "Disputes during move-out",
            suggestion: "Add refundable deposit clause",
            example_clause: "Tenant shall pay a refundable security deposit of INR 50,000..."
          },
          {
            title: "Missing Termination Clause",
            problem: "No exit policy defined",
            impact: "Legal disputes",
            suggestion: "Add notice period clause",
            example_clause: "Either party must give 30 days notice before termination..."
          }
        ]
      };

      console.log("DEBUG: Analysis completed successfully:", result);
      setAnalysis(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze agreement');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return <CheckCircle color="success" />;
      case 'medium':
        return <Warning color="warning" />;
      case 'high':
        return <Error color="error" />;
      default:
        return <TrendingUp />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };

  if (loading) {
    return (
      <>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Analyzing agreement...
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
            <Button variant="outlined" onClick={analyzeAgreement}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header with Score and Risk */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Agreement Analysis
          </Typography>
          
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2 }}>
            {/* Score */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: getScoreColor(analysis.score),
                mb: 0.5
              }}>
                {analysis.score}/100
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Score
              </Typography>
            </Box>

            {/* Risk Level */}
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {getRiskIcon(analysis.risk)}
                <Chip 
                  label={analysis.risk}
                  color={getRiskColor(analysis.risk)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Risk Level
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Suggestions Section */}
        {analysis && analysis.issues && analysis.issues.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Lightbulb color="info" />
              Suggestions ({analysis.issues.length})
            </Typography>
            
            {/* Show first 2 suggestions */}
            <Stack spacing={2}>
              {analysis.issues.slice(0, 2).map((issue, index) => (
                <Alert 
                  key={index}
                  severity={issue.title.includes('Error') || issue.title.includes('Service') ? 'error' : 'warning'}
                  sx={{ '& .MuiAlert-message': { width: '100%' } }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    {issue.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {issue.problem}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontStyle: 'italic',
                    color: 'success.main',
                    fontWeight: 500
                  }}>
                    <strong>Suggestion:</strong> {issue.suggestion}
                  </Typography>
                </Alert>
              ))}
            </Stack>

            {/* Show more issues indicator */}
            {analysis.issues.length > 2 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  ... and {analysis.issues.length - 2} more issues
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Review & Improve Button */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Visibility />}
            onClick={onReviewClick}
            sx={{ 
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600
            }}
          >
            Review & Improve
          </Button>
        </Box>
      </CardContent>
    </Card>

    {/* Error Snackbar */}
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      message={error || "Analysis failed. Please try again."}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    />
    </>
  );
}
