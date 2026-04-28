import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  alpha
} from '@mui/material';
import {
  ExpandMore,
  Close as CloseIcon,
  TrendingUp,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Lightbulb,
  Description,
  ContentCopy,
  Gavel,
  Download,
  Security,
  AssignmentLate,
  Timeline,
  HomeRepairService
} from '@mui/icons-material';
import PaymentButton from './PaymentButton';
import { getQualityLevel, QUALITY_CONFIG } from '../utils/agreementQuality.js';
import ImprovementSection from './ImprovementSection.jsx';

// Local error boundary component
class ModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ReviewImproveModal Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          <Typography variant="h6">Unable to load review</Typography>
          <Typography variant="body2">
            Something went wrong while loading the agreement review. Please try again later.
          </Typography>
          <Button onClick={this.props.retry} sx={{ mt: 1 }}>
            Try Again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default function ReviewImproveModal({ 
  open, 
  onClose, 
  agreement, 
  onDownloadSummary 
}) {
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [error, setError] = useState('');
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);

  // Content-based deterministic scoring
  const calculateScore = (text) => {
    if (!text) return { score: 50, riskLevel: 'Medium', issues: [] };
    
    let score = 100;
    const issues = [];
    const textLower = text.toLowerCase();
    
    // Check for missing critical clauses - expanded to 20+ checks
    const checks = [
      {
        pattern: /security deposit|deposit.*refund|refundable deposit/i,
        deduction: 15,
        title: 'Missing Security Deposit Terms',
        problem: 'No clear security deposit terms including amount, refund conditions, or timeline.',
        suggestion: 'Add a dedicated section specifying security deposit amount, refund conditions, and timeline.',
        example_clause: 'The Tenant shall pay a refundable security deposit of INR 20,000 to the Landlord within 7 days of signing this agreement. The deposit shall be refunded within 30 days of tenancy termination.'
      },
      {
        pattern: /termination.*notice|notice.*termination|terminate.*notice/i,
        deduction: 20,
        title: 'Missing Termination Notice Clause',
        problem: 'No clear notice period for terminating the lease agreement.',
        suggestion: 'Specify notice periods required for termination by either party.',
        example_clause: 'Either party may terminate this agreement by giving 30 days written notice to the other party.'
      },
      {
        pattern: /utilities|electricity|water|gas.*bill/i,
        deduction: 10,
        title: 'Missing Utilities Clause',
        problem: 'Agreement does not specify responsibility for utility payments.',
        suggestion: 'Clearly define which party is responsible for each utility payment.',
        example_clause: 'The Tenant shall be responsible for payment of electricity, water, and cooking gas bills.'
      },
      {
        pattern: /late.*payment|payment.*late|delayed.*payment/i,
        deduction: 10,
        title: 'Missing Late Payment Clause',
        problem: 'No provisions for late rent payments or associated penalties.',
        suggestion: 'Add late payment fees and consequences for delayed payments.',
        example_clause: 'If the rent is not paid by the 5th day of each month, a late payment fee of 2% per month shall be charged.'
      },
      {
        pattern: /pet|pets|animal/i,
        deduction: 5,
        title: 'Missing Pet Policy',
        problem: 'No clear policy regarding pets in the rental property.',
        suggestion: 'Specify whether pets are allowed and any associated conditions.',
        example_clause: 'Pets are not allowed in the rental property without prior written consent from the Landlord.'
      },
      {
        pattern: /maintenance.*repair|repair.*maintenance/i,
        deduction: 8,
        title: 'Missing Maintenance Clause',
        problem: 'No clear definition of maintenance responsibilities.',
        suggestion: 'Clearly define maintenance responsibilities for both parties.',
        example_clause: 'The Tenant shall be responsible for routine maintenance and minor repairs. The Landlord shall be responsible for major structural repairs.'
      },
      {
        pattern: /rent.*increase|increase.*rent|escalation/i,
        deduction: 7,
        title: 'Missing Rent Escalation Clause',
        problem: 'No provisions for rent increases during the lease term.',
        suggestion: 'Add rent escalation terms with reasonable limits and notice periods.',
        example_clause: 'The rent may be increased by up to 10% annually with 60 days written notice to the Tenant.'
      },
      {
        pattern: /dispute.*resolution|mediation|arbitration/i,
        deduction: 8,
        title: 'Missing Dispute Resolution',
        problem: 'No mechanism for resolving disputes between parties.',
        suggestion: 'Include dispute resolution process with mediation or arbitration.',
        example_clause: 'Any disputes arising under this agreement shall first be referred to mediation. If mediation fails, disputes shall be resolved through arbitration.'
      },
      {
        pattern: /property.*damage|damage.*property/i,
        deduction: 6,
        title: 'Missing Property Damage Clause',
        problem: 'No terms for handling property damage by tenant.',
        suggestion: 'Specify procedures for assessing and recovering damage costs.',
        example_clause: 'The Tenant shall maintain the property in good condition and shall be liable for any damage caused by negligence.'
      },
      {
        pattern: /sublet|subletting|sublease/i,
        deduction: 5,
        title: 'Missing Subletting Clause',
        problem: 'No terms regarding subletting or subleasing the property.',
        suggestion: 'Specify conditions and requirements for subletting the property.',
        example_clause: 'The Tenant shall not sublet or assign the premises without prior written consent from the Landlord.'
      },
      {
        pattern: /guest|visitor|occupant/i,
        deduction: 5,
        title: 'Missing Guest Policy',
        problem: 'No clear policy regarding guests and visitors in the property.',
        suggestion: 'Specify rules for guests, overnight visitors, and maximum occupancy.',
        example_clause: 'The Tenant may have guests stay for up to 7 days without additional charge. Longer stays require prior written consent from the Landlord.'
      },
      {
        pattern: /parking|vehicle|car/i,
        deduction: 6,
        title: 'Missing Parking Clause',
        problem: 'No terms regarding parking facilities or vehicle storage.',
        suggestion: 'Specify parking arrangements, if any, and associated costs.',
        example_clause: 'One parking space is provided to the Tenant at no additional cost. Additional vehicles require prior approval and may incur additional charges.'
      },
      {
        pattern: /furniture|furnishing|appliance/i,
        deduction: 5,
        title: 'Missing Furniture/Equipment Clause',
        problem: 'No inventory of provided furniture and appliances.',
        suggestion: 'Include an inventory list of provided items and their condition.',
        example_clause: 'The Landlord provides the following furniture and appliances in good working condition: [List items]. The Tenant shall maintain these items and return them in the same condition.'
      },
      {
        pattern: /entry.*notice|notice.*entry|landlord.*access/i,
        deduction: 7,
        title: 'Missing Landlord Entry Clause',
        problem: 'No terms specifying landlord\'s right to enter the property.',
        suggestion: 'Specify notice periods and reasons for landlord entry.',
        example_clause: 'The Landlord may enter the premises with 24 hours written notice for inspections, repairs, or showing the property to prospective tenants.'
      },
      {
        pattern: /noise|quiet|sound/i,
        deduction: 4,
        title: 'Missing Noise/Conduct Clause',
        problem: 'No behavioral expectations regarding noise and conduct.',
        suggestion: 'Include noise restrictions and conduct expectations.',
        example_clause: 'The Tenant shall maintain reasonable quiet and not engage in activities that disturb neighbors. Quiet hours are from 10 PM to 8 AM.'
      },
      {
        pattern: /insurance|liability|indemnif/i,
        deduction: 8,
        title: 'Missing Insurance Clause',
        problem: 'No insurance requirements or liability provisions.',
        suggestion: 'Specify insurance requirements and liability allocations.',
        example_clause: 'The Tenant shall maintain renter\'s insurance with minimum coverage of INR 100,000 for personal property and liability.'
      },
      {
        pattern: /refund|return.*deposit|security.*return/i,
        deduction: 10,
        title: 'Missing Deposit Refund Clause',
        problem: 'No specific terms for deposit refund process and timeline.',
        suggestion: 'Detail the deposit refund process, timeline, and deduction conditions.',
        example_clause: 'The security deposit shall be refunded within 30 days of tenancy termination, minus deductions for damages, unpaid rent, or cleaning costs.'
      },
      {
        pattern: /cleaning|cleanliness|move.*out/i,
        deduction: 5,
        title: 'Missing Cleaning/Move-out Clause',
        problem: 'No cleaning requirements or move-out procedures.',
        suggestion: 'Specify cleaning standards and move-out procedures.',
        example_clause: 'Upon termination, the Tenant shall return the premises in a clean and habitable condition, professionally cleaned, with all personal property removed.'
      },
      {
        pattern: /lock|key|access.*card/i,
        deduction: 4,
        title: 'Missing Key/Access Clause',
        problem: 'No terms regarding keys, locks, or access devices.',
        suggestion: 'Specify key requirements, lock changes, and access device return.',
        example_clause: 'The Tenant shall receive 2 sets of keys. All keys and access devices must be returned upon termination. Lost keys incur a replacement fee of INR 500.'
      },
      {
        pattern: /storage|common.*area|shared/i,
        deduction: 4,
        title: 'Missing Common Area Usage Clause',
        problem: 'No terms regarding use of common areas and shared facilities.',
        suggestion: 'Specify rights and responsibilities for common area usage.',
        example_clause: 'The Tenant shall have reasonable use of common areas including [list areas] and shall maintain them in a clean and orderly manner.'
      },
      {
        pattern: /illegal|prohibited|forbidden/i,
        deduction: 6,
        title: 'Missing Prohibited Activities Clause',
        problem: 'No list of prohibited activities in the rental property.',
        suggestion: 'Specify prohibited activities and their consequences.',
        example_clause: 'The Tenant shall not engage in illegal activities, drug use, or business activities on the premises. Violation constitutes grounds for immediate termination.'
      }
    ];

    checks.forEach(check => {
      if (!check.pattern.test(text)) {
        score -= check.deduction;
        issues.push({
          type: 'missing_clause',
          severity: check.deduction >= 15 ? 'high' : 'medium',
          title: check.title,
          problem: check.problem,
          suggestion: check.suggestion,
          example_clause: check.example_clause,
          impact: `Missing ${check.title.toLowerCase()} may lead to legal disputes or confusion.`
        });
      }
    });

    // Add additional issue types to ensure comprehensive analysis
    // Check for ambiguous terms
    if (!text.match(/reasonable|adequate|appropriate/i)) {
      score -= 3;
      issues.push({
        type: 'ambiguous_language',
        severity: 'medium',
        title: 'Ambiguous Language Detected',
        problem: 'Agreement contains vague terms that could lead to interpretation disputes.',
        suggestion: 'Replace vague terms with specific, measurable language.',
        example_clause: 'Replace "reasonable time" with "within 7 business days". Replace "adequate notice" with "at least 30 days written notice".',
        impact: 'Ambiguous terms can lead to disputes over interpretation and enforcement.'
      });
    }

    // Check for specific dates and amounts
    if (!text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december/i)) {
      score -= 4;
      issues.push({
        type: 'missing_specific_dates',
        severity: 'medium',
        title: 'Missing Specific Dates',
        problem: 'Agreement lacks specific dates for key milestones.',
        suggestion: 'Include specific dates for rent due dates, lease start/end, notice periods.',
        example_clause: 'Lease term: January 1, 2025 to December 31, 2025. Rent due: 5th of each month.',
        impact: 'Missing specific dates creates uncertainty about timeline and deadlines.'
      });
    }

    // Check for monetary amounts
    if (!text.match(/₹|inr|rs\.|amount.*\d+|\d+.*rupees/i)) {
      score -= 5;
      issues.push({
        type: 'missing_monetary_amounts',
        severity: 'high',
        title: 'Missing Specific Monetary Amounts',
        problem: 'Agreement lacks specific monetary amounts for rent, deposits, penalties.',
        suggestion: 'Specify exact amounts in INR for all financial obligations.',
        example_clause: 'Monthly rent: INR 15,000. Security deposit: INR 30,000. Late payment fee: 2% per month.',
        impact: 'Missing specific amounts can lead to payment disputes and confusion.'
      });
    }

    // Check for contact information
    if (!text.match(/phone|mobile|email|address|contact/i)) {
      score -= 3;
      issues.push({
        type: 'missing_contact_info',
        severity: 'medium',
        title: 'Missing Contact Information',
        problem: 'Agreement lacks contact information for both parties.',
        suggestion: 'Include complete contact details for landlord and tenant.',
        example_clause: 'Landlord Contact: [Name], [Phone], [Email], [Address]. Tenant Contact: [Name], [Phone], [Email].',
        impact: 'Missing contact information makes communication difficult during disputes.'
      });
    }

    // Check for witness/notary
    if (!text.match(/witness|notary|attest|signature.*witness/i)) {
      score -= 2;
      issues.push({
        type: 'missing_witnesses',
        severity: 'low',
        title: 'Missing Witness/Notary Clause',
        problem: 'Agreement lacks witnesses or notarization for legal validity.',
        suggestion: 'Include witness signatures or notarization for stronger legal standing.',
        example_clause: 'Signed in the presence of: [Witness 1 Name], [Witness 2 Name]. Notarized by: [Notary Name].',
        impact: 'Without witnesses, the agreement may have weaker legal enforceability.'
      });
    }

    // Check for jurisdiction/court
    if (!text.match(/jurisdiction|court|legal.*venue|dispute.*court/i)) {
      score -= 4;
      issues.push({
        type: 'missing_jurisdiction',
        severity: 'medium',
        title: 'Missing Jurisdiction Clause',
        problem: 'Agreement does not specify which court has jurisdiction over disputes.',
        suggestion: 'Specify the jurisdiction and court for dispute resolution.',
        example_clause: 'This agreement shall be governed by the laws of [State/City]. Any disputes shall be resolved in the courts of [City].',
        impact: 'Missing jurisdiction clause can lead to venue disputes and legal uncertainty.'
      });
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    // Determine risk level based on score
    let riskLevel;
    if (score >= 80) {
      riskLevel = 'Low';
    } else if (score >= 50) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'High';
    }

    return { score, riskLevel, issues };
  };

  // Generate review data with content-based deterministic analysis
  useEffect(() => {
    const handleReviewAnalysis = async () => {
      if (!open || !agreement || loading) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get agreement text
        const agreementText = agreement.text || agreement.content || '';
        
        // Calculate score based on content
        const analysis = calculateScore(agreementText);
        
        // Generate review data
        const reviewData = {
          score: analysis.score,
          riskLevel: analysis.riskLevel,
          suggestions: analysis.issues || [],
          improvedClauses: [
            {
              original: 'The tenant shall pay rent on time.',
              improved: 'The tenant shall pay the monthly rent of [AMOUNT] on or before the 5th day of each month. Late payments beyond 5 days shall incur a penalty of 2% per month on the outstanding amount.',
              reason: 'Added specific amount, due date, and penalty clause for clarity and enforcement.'
            }
          ],
          compliance: {
            score: analysis.score,
            issues: (analysis.issues || []).slice(0, 3)
          },
          quality: {
            score: 70,
            clarity: 65,
            completeness: 75,
            legalCompliance: 80
          }
        };

        console.log("Review data generated:", reviewData);
        console.log("Compliance issues:", reviewData.compliance.issues);

        setReviewData(reviewData);
      } catch (err) {
        console.error('Error generating review:', err);
        setError('Failed to generate review. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleReviewAnalysis();
  }, [open, agreement]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setReviewData(null);
      setError('');
      setLoading(false);
    }
  }, [open]);

  // Retry function
  const handleRetry = () => {
    setErrorBoundaryKey(prev => prev + 1);
    setLoading(false);
  };

  // Copy to clipboard function
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  if (!open) return null;

  return (
    <ModalErrorBoundary key={errorBoundaryKey} retry={handleRetry}>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '600px',
            maxHeight: '80vh'
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
            Agreement Review & Improvement
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>Analyzing agreement...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {reviewData && (() => {
            // Derive single quality level using shared logic
            const qualityLevel = getQualityLevel(reviewData.quality.score);
            const config = QUALITY_CONFIG[qualityLevel] || {
              color: '#666666',
              icon: 'CheckCircle',
              banner: { show: false, type: null, message: null },
              qualityCard: { show: false, message: null },
              improvementSection: { show: true, heading: 'Review Summary' }
            };

            // Map icon string to component
            const IconComponent = config.icon === 'CheckCircle' ? CheckCircleIcon :
                                  config.icon === 'Warning' ? WarningIcon :
                                  config.icon === 'Error' ? ErrorIcon :
                                  CheckCircleIcon;

            return (
              <Stack spacing={3}>
                  {/* Score and Risk Level */}
                  <Card sx={{
                    background: `linear-gradient(135deg, ${alpha(config?.color || '#666666', 0.05)} 0%, ${alpha(config?.color || '#666666', 0.1)} 100%)`,
                    border: `1px solid ${alpha(config?.color || '#666666', 0.2)}`
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconComponent />
                        Overall Assessment
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="h4" sx={{ fontWeight: 700, color: config?.color || '#666666' }}>
                          {reviewData.score}/100
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: config?.color || '#666666' }}>
                            {qualityLevel} Quality
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Risk Level: {reviewData.riskLevel}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>

                {/* Quality Breakdown */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUp />
                      Quality Breakdown
                    </Typography>
                    <Stack spacing={2}>
                      {Object.entries(reviewData.quality).map(([key, value]) => (
                        <Box key={key}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {value}/100
                            </Typography>
                          </Stack>
                          <Box sx={{ 
                            width: '100%', 
                            height: 8, 
                            bgcolor: 'grey.200', 
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${value}%`, 
                              height: '100%', 
                              bgcolor: value >= 80 ? 'success.main' : value >= 60 ? 'warning.main' : 'error.main',
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                {(() => {
                  console.log("Rendering suggestions:", reviewData.suggestions);
                  return Array.isArray(reviewData.suggestions) && reviewData.suggestions.length > 0;
                })() && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Lightbulb color="info" />
                        Improvement Suggestions ({reviewData.suggestions.length})
                      </Typography>
                      <Stack spacing={2}>
                        {reviewData.suggestions
                          .filter(item => item && typeof item === "object")
                          .map((suggestion, index) => (
                          <Alert
                            key={index}
                            severity={suggestion?.severity === 'high' ? 'error' : suggestion?.severity === 'medium' ? 'warning' : 'info'}
                            sx={{ '& .MuiAlert-message': { width: '100%' } }}
                          >
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              {suggestion?.title || "No title"}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {suggestion?.problem || "No problem description"}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {suggestion?.suggestion || "No suggestion available"}
                            </Typography>
                            <Typography variant="body2" sx={{
                              fontStyle: 'italic',
                              color: 'text.secondary'
                            }}>
                              Impact: {suggestion?.impact || "No impact information"}
                            </Typography>
                            {suggestion?.example_clause && (
                              <Box sx={{
                                mt: 2,
                                p: 2,
                                bgcolor: 'grey.50',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'info.200',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                position: 'relative'
                              }}>
                                <Button
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    minWidth: 'auto',
                                    p: 0.5
                                  }}
                                  onClick={() => {
                                    navigator.clipboard.writeText(suggestion.example_clause);
                                  }}
                                >
                                  <ContentCopy sx={{ fontSize: 16 }} />
                                </Button>
                                {suggestion.example_clause}
                              </Box>
                            )}
                          </Alert>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Improved Clauses */}
                {(() => {
                  console.log("Rendering improvedClauses:", reviewData.improvedClauses);
                  return Array.isArray(reviewData.improvedClauses) && reviewData.improvedClauses.length > 0;
                })() && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Gavel />
                        Improved Clauses ({reviewData.improvedClauses.length})
                      </Typography>
                      <Stack spacing={2}>
                        {reviewData.improvedClauses
                          .filter(item => item && typeof item === "object")
                          .map((clause, index) => (
                          <Accordion key={index}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Clause {index + 1}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                    Original:
                                  </Typography>
                                  <Typography variant="body2" sx={{
                                    bgcolor: 'grey.100',
                                    p: 1,
                                    borderRadius: 1,
                                    fontStyle: 'italic'
                                  }}>
                                    {clause?.original || "No original text"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                    Improved:
                                  </Typography>
                                  <Typography variant="body2" sx={{
                                    bgcolor: 'success.50',
                                    p: 1,
                                    borderRadius: 1
                                  }}>
                                    {clause?.improved || "No improved text"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
                                    Reason:
                                  </Typography>
                                  <Typography variant="body2" sx={{
                                    bgcolor: 'info.50',
                                    p: 1,
                                    borderRadius: 1
                                  }}>
                                    {clause?.reason || "No reason provided"}
                                  </Typography>
                                </Box>
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Compliance Issues */}
                {(() => {
                  console.log("Rendering compliance issues:", reviewData.compliance?.issues);
                  return reviewData.compliance?.issues?.length > 0;
                })() && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security />
                        Compliance Issues ({reviewData.compliance.issues.length})
                      </Typography>
                      <Stack spacing={2}>
                        {reviewData.compliance.issues.map((issue, index) => (
                          <Alert key={index} severity="warning">
                            <Typography variant="body2">
                              {issue?.description || issue?.title || "No description available"}
                            </Typography>
                          </Alert>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Download Section */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Description />
                      Report Summary
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Download a comprehensive PDF report with all improvements, compliance notes, and enhanced clauses.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={onDownloadSummary}
                      disabled={!reviewData}
                    >
                      Download Summary PDF
                    </Button>
                  </CardContent>
                </Card>

                <Box sx={{
                  p: 3,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'grey.50'
                }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lightbulb color="info" />
                    Recommendations & Improvements
                  </Typography>

                  <Box sx={{
                    filter: 'blur(6px)',
                    opacity: 0.7,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    <Stack spacing={2}>
                      {[
                        {
                          title: "Missing Security Deposit Terms",
                          severity: "high",
                          description: "Your agreement lacks clear security deposit terms including amount, refund conditions, and timeline.",
                          improvement: "Add a dedicated section specifying security deposit amount (typically 2-3 months rent), refund conditions, and timeline for refund after vacating."
                        },
                        {
                          title: "Ambiguous Maintenance Responsibility",
                          severity: "medium",
                          description: "Maintenance responsibilities are not clearly defined between landlord and tenant.",
                          improvement: "Clearly specify which party is responsible for different types of maintenance (structural vs. routine) and the procedure for reporting issues."
                        },
                        {
                          title: "No Rent Escalation Clause",
                          severity: "medium",
                          description: "Missing terms for rent increases during the lease period.",
                          improvement: "Add rent escalation terms with percentage limits and notice period for any increases."
                        },
                        {
                          title: "Unclear Notice Period",
                          severity: "high",
                          description: "Notice period for termination is not properly specified.",
                          improvement: "Define clear notice periods for both parties (typically 30-60 days) with specific conditions."
                        },
                        {
                          title: "Missing Exit Conditions",
                          severity: "high",
                          description: "No clear terms for property handover and inspection.",
                          improvement: "Add detailed exit conditions including inspection process, handover checklist, and timeline."
                        },
                        {
                          title: "No Dispute Resolution Clause",
                          severity: "medium",
                          description: "Missing mechanism for resolving disputes between parties.",
                          improvement: "Include dispute resolution clause specifying mediation/arbitration process and jurisdiction."
                        }
                      ].map((issue, index) => (
                        <Card key={index} sx={{
                          border: `1px solid ${issue?.severity === 'high' ? 'error.200' : 'warning.200'}`,
                          bgcolor: issue?.severity === 'high' ? 'error.50' : 'warning.50'
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack spacing={1}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                {issue?.severity === 'high' ? <ErrorIcon color="error" fontSize="small" /> : <WarningIcon color="warning" fontSize="small" />}
                                {issue?.title || "Issue"}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {issue?.description || "No description available"}
                              </Typography>
                              <Typography variant="body2" sx={{
                                fontStyle: 'italic',
                                color: 'success.main',
                                fontWeight: 500
                              }}>
                                <strong>Improvement:</strong> {issue?.improvement || "No improvement available"}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Box>

                  <Box sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    textAlign: 'center'
                  }}>
                    <PaymentButton />
                  </Box>
                </Box>
              </Stack>
            );
          })()}

        <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
        </DialogContent>
      </Dialog>
    </ModalErrorBoundary>
  );
}
