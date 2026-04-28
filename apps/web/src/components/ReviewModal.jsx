import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Alert,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy,
  Error as ErrorIcon,
  Warning,
  CheckCircle,
  Lightbulb,
  Assignment,
  Description
} from '@mui/icons-material';

export default function ReviewModal({ open, onClose, analysis }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleCopyClause = (clause, index) => {
    navigator.clipboard.writeText(clause).then(() => {
      setCopiedIndex(index);
      setSnackbarOpen(true);
      setTimeout(() => setCopiedIndex(null), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getSeverityIcon = (title) => {
    if (title.includes('Error') || title.includes('Service')) {
      return <ErrorIcon color="error" />;
    }
    if (title.includes('Missing') || title.includes('Unclear') || title.includes('No')) {
      return <Warning color="warning" />;
    }
    return <CheckCircle color="success" />;
  };

  const getSeverityColor = (title) => {
    if (title.includes('Error') || title.includes('Service')) {
      return 'error';
    }
    if (title.includes('Missing') || title.includes('Unclear') || title.includes('No')) {
      return 'warning';
    }
    return 'success';
  };

  if (!analysis) {
    return null;
  }

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '600px',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Detailed Agreement Review
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Summary Section */}
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%)',
              border: '1px solid rgba(25, 118, 210, 0.2)'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment />
                  Analysis Summary
                </Typography>
                <Stack direction="row" spacing={3} alignItems="center">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: analysis.score >= 80 ? 'success.main' : analysis.score >= 60 ? 'warning.main' : 'error.main',
                      mb: 0.5
                    }}>
                      {analysis.score}/100
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Score
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Chip 
                      label={analysis.risk}
                      color={analysis.risk === 'Low' ? 'success' : analysis.risk === 'Medium' ? 'warning' : 'error'}
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block">
                      Risk Level
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: 'primary.main',
                      mb: 0.5
                    }}>
                      {analysis.issues?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Issues Found
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Issues Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb color="info" />
                Issues & Improvements ({analysis.issues?.length || 0})
              </Typography>
              
              <Stack spacing={2}>
                {analysis.issues?.map((issue, index) => (
                  <Card key={index} sx={{ 
                    border: `1px solid ${getSeverityColor(issue.title) === 'error' ? 'error.200' : getSeverityColor(issue.title) === 'warning' ? 'warning.200' : 'success.200'}`,
                    bgcolor: getSeverityColor(issue.title) === 'error' ? 'error.50' : getSeverityColor(issue.title) === 'warning' ? 'warning.50' : 'success.50'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        {/* Issue Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          {getSeverityIcon(issue.title)}
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {issue.title}
                          </Typography>
                        </Box>

                        {/* Problem Description */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                            Problem:
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            {issue.problem}
                          </Typography>
                        </Box>

                        {/* Impact */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                            Impact:
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.6, color: 'error.main' }}>
                            {issue.impact}
                          </Typography>
                        </Box>

                        {/* Suggestion */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
                            Suggestion:
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            lineHeight: 1.6, 
                            bgcolor: 'success.50', 
                            p: 2, 
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'success.200'
                          }}>
                            {issue.suggestion}
                          </Typography>
                        </Box>

                        {/* Example Clause */}
                        {issue.example_clause && issue.example_clause !== 'N/A' && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Description />
                              Example Clause:
                            </Typography>
                            <Box sx={{ 
                              position: 'relative',
                              bgcolor: 'grey.50', 
                              p: 2.5, 
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'grey.300',
                              fontStyle: 'italic',
                              fontSize: '0.9rem',
                              lineHeight: 1.6
                            }}>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {issue.example_clause}
                              </Typography>
                              
                              {/* Copy Button */}
                              <Tooltip title={copiedIndex === index ? "Copied!" : "Copy clause"}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleCopyClause(issue.example_clause, index)}
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'grey.300',
                                    '&:hover': {
                                      bgcolor: 'grey.100'
                                    }
                                  }}
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Clause copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
