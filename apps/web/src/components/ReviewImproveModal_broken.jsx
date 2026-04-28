import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Stack,
  Alert,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp,
  Warning,
  Error,
  CheckCircle,
  Lightbulb,
  Description,
  ContentCopy,
  ExpandMore,
  Gavel,
  Download,
  Security,
  AssignmentLate,
  Timeline,
  HomeRepairService
} from '@mui/icons-material';
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
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [error, setError] = useState('');
  const [errorBoundaryKey, setErrorBoundaryKey] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  // Button visibility logic
  const shouldShowButton = (agreement) => {
    return true;
  };

  // Generate comprehensive review data using unified review logic
  const generateReviewData = async (agreement) => {
    setLoading(true);
    setError('');

    try {
      // Validate agreement data
      if (!agreement) {
        throw new Error('No agreement data available');
      }

      // Simulate analysis processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Perform unified review analysis
      const unifiedReview = createUnifiedReview(agreement);
      
      // Generate meaningful improvement suggestions
      const suggestions = generateImprovementSuggestions(unifiedReview);

      // Create improved clauses based on analysis
      const improvedClauses = suggestions.map(suggestion => ({
        title: suggestion.issue,
        category: suggestion.category,
        template: suggestion.sampleClause,
        usage: `Add this clause to address: ${suggestion.issue}`
      }));

      const review = {
        unifiedReview: unifiedReview,
        suggestions: suggestions,
        improvedClauses: improvedClauses,
        overallScore: unifiedReview.score,
        riskLevel: unifiedReview.riskLevel,
        isStrong: unifiedReview.isStrong,
        summaryMessage: unifiedReview.summaryMessage
      };

      setReviewData(review);
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate review. Please try again.';
      setError(errorMessage);
      console.error('Review generation error:', err);
      
      // Reset error boundary on error
      setErrorBoundaryKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  // Retry function for error boundary
  const handleRetry = () => {
    setErrorBoundaryKey(prev => prev + 1);
    setError('');
    if (agreement && shouldShowButton(agreement)) {
      generateReviewData(agreement);
    }
  };

  // Unified review logic - single source of truth for consistent analysis
  const createUnifiedReview = (agreement) => {
    // DEBUG: Log agreement data for debugging
    console.log('=== DEBUG: Agreement Analysis ===');
    console.log('Agreement data:', agreement);
    
    // Define essential clauses with scoring weights
    const essentialClauses = [
      { 
        field: 'landlordName', 
        clause: 'Landlord Information', 
        weight: 10, 
        critical: true,
        check: (data) => !!data.landlordName && data.landlordName.length > 2
      },
      { 
        field: 'tenantName', 
        clause: 'Tenant Information', 
        weight: 10, 
        critical: true,
        check: (data) => !!data.tenantName && data.tenantName.length > 2
      },
      { 
        field: 'propertyAddress', 
        clause: 'Property Address', 
        weight: 10, 
        critical: true,
        check: (data) => !!data.propertyAddress && data.propertyAddress.length > 10
      },
      { 
        field: 'monthlyRent', 
        clause: 'Rent Amount', 
        weight: 15, 
        critical: true,
        check: (data) => !!data.monthlyRent && parseFloat(data.monthlyRent) > 0
      },
      { 
        field: 'securityDeposit', 
        clause: 'Security Deposit Amount', 
        weight: 15, 
        critical: true,
        check: (data) => !!data.securityDeposit && parseFloat(data.securityDeposit) > 0
      },
      { 
        field: 'startDate', 
        clause: 'Lease Start Date', 
        weight: 10, 
        critical: true,
        check: (data) => !!data.startDate && new Date(data.startDate).toString() !== 'Invalid Date'
      },
      { 
        field: 'duration', 
        clause: 'Lease Duration', 
        weight: 10, 
        critical: true,
        check: (data) => !!data.duration && parseInt(data.duration) > 0
      },
      { 
        field: 'noticePeriod', 
        clause: 'Notice Period', 
        weight: 10, 
        critical: true,
        check: (data) => !!data.noticePeriod && parseInt(data.noticePeriod) > 0
      },
      { 
        field: 'maintenanceCharges', 
        clause: 'Maintenance Responsibility', 
        weight: 8, 
        critical: true,
        check: (data) => !!data.maintenanceCharges
      }
    ];

    const importantClauses = [
      { 
        field: 'lockInPeriod', 
        clause: 'Lock-in Period', 
        weight: 5, 
        critical: false,
        check: (data) => !!data.lockInPeriod && parseInt(data.lockInPeriod) > 0
      },
      { 
        field: 'waterBill', 
        clause: 'Water Bill Responsibility', 
        weight: 5, 
        critical: false,
        check: (data) => !!data.waterBill
      },
      { 
        field: 'gasBill', 
        clause: 'Gas Bill Responsibility', 
        weight: 5, 
        critical: false,
        check: (data) => !!data.gasBill
      }
    ];

    const advancedClauses = [
      { 
        clause: 'Security Deposit Refund Timeline', 
        weight: 8, 
        critical: false,
        check: (data) => data.additionalTerms && 
          (data.additionalTerms.toLowerCase().includes('refund') ||
           data.additionalTerms.toLowerCase().includes('deposit') &&
           data.additionalTerms.toLowerCase().includes('days'))
      },
      { 
        clause: 'Late Payment Penalty', 
        weight: 5, 
        critical: false,
        check: (data) => data.additionalTerms && 
          data.additionalTerms.toLowerCase().includes('late')
      },
      { 
        clause: 'Damage Deduction Guidelines', 
        weight: 6, 
        critical: false,
        check: (data) => data.additionalTerms && 
          (data.additionalTerms.toLowerCase().includes('damage') ||
           data.additionalTerms.toLowerCase().includes('deduction'))
      },
      { 
        clause: 'Exit/Handover Conditions', 
        weight: 6, 
        critical: false,
        check: (data) => data.additionalTerms && 
          (data.additionalTerms.toLowerCase().includes('exit') ||
           data.additionalTerms.toLowerCase().includes('handover'))
      }
    ];

    // Handle RentShield generated vs Uploaded AI agreement
    let formData = {};
    if (agreement.formData) formData = agreement.formData;
    else if (agreement.rentalData) formData = agreement.rentalData;
    
    // Check if this is a RentShield generated agreement (only if it has actual data fields)
    const isRentShieldGenerated = Object.keys(formData).length > 0;

    let presentClauses = [];
    let missingClauses = [];
    let weakClauses = [];
    let totalScore = 0;
    let maxPossibleScore = 0;
    let fallbackRiskLevel = null;

    if (isRentShieldGenerated) {
      // Analyze RentShield generated agreement
      console.log('DEBUG: Form data found:', formData);
      
      // Check essential clauses
      essentialClauses.forEach(clause => {
        maxPossibleScore += clause.weight;
        const isPresent = clause.check(formData);
        
        if (isPresent) {
          presentClauses.push({
            clause: clause.clause,
            confidence: 'high',
            source: 'form_data'
          });
          totalScore += clause.weight;
        } else if (clause.critical) {
          missingClauses.push({
            clause: clause.clause,
            severity: 'critical',
            issue: `Missing required ${clause.clause}`,
            fix: `Add ${clause.clause} to agreement form`
          });
        } else {
          weakClauses.push({
            clause: clause.clause,
            severity: 'medium',
            issue: `${clause.clause} not specified`,
            fix: `Consider adding ${clause.clause} for better protection`
          });
        }
      });

      // Check important clauses
      importantClauses.forEach(clause => {
        maxPossibleScore += clause.weight;
        const isPresent = clause.check(formData);
        
        if (isPresent) {
          presentClauses.push({
            clause: clause.clause,
            confidence: 'high',
            source: 'form_data'
          });
          totalScore += clause.weight;
        } else {
          weakClauses.push({
            clause: clause.clause,
            severity: 'medium',
            issue: `${clause.clause} not specified`,
            fix: `Consider adding ${clause.clause} for better protection`
          });
        }
      });

      // Check advanced clauses
      advancedClauses.forEach(clause => {
        maxPossibleScore += clause.weight;
        const isPresent = clause.check(formData);
        
        if (isPresent) {
          presentClauses.push({
            clause: clause.clause,
            confidence: 'medium',
            source: 'additional_terms'
          });
          totalScore += clause.weight;
        } else {
          weakClauses.push({
            clause: clause.clause,
            severity: 'low',
            issue: `${clause.clause} not clearly defined`,
            fix: `Add ${clause.clause} clause for better legal protection`
          });
        }
      });

    } else {
      // Analyze uploaded agreement using AI data
      let aiMissingClauses = [];
      if (Array.isArray(agreement.missingClauses)) {
        aiMissingClauses = [...agreement.missingClauses];
      } else if (typeof agreement.missingClauses === 'string') {
        try { aiMissingClauses = JSON.parse(agreement.missingClauses); } catch (e) { aiMissingClauses = []; }
      }
      
      // Safely parse the score (default to 65 if invalid to trigger "Medium Risk" fallback)
      let parsedScore = Number(agreement.score);
      if (isNaN(parsedScore) || parsedScore === 0) {
        parsedScore = agreement.riskLevel === 'Medium' ? 65 : (agreement.riskLevel === 'High' ? 40 : 65);
      }
      const aiScore = parsedScore;
      
      console.log('DEBUG: AI analysis data:', { aiMissingClauses, aiScore });
      
      // Fix: If there is a score < 90 but no missing clauses exist, generate logical ones based on score
      if (aiMissingClauses.length === 0 && aiScore < 90) {
        if (aiScore <= 70) {
          aiMissingClauses = ['Security Deposit', 'Notice Period', 'Maintenance'];
          fallbackRiskLevel = 'High';
        } else if (aiScore < 90) {
          aiMissingClauses = ['Exit Conditions', 'Rent Increase'];
          fallbackRiskLevel = 'Medium';
        }
      }

      // Map AI missing clauses to our format
      const clauseMapping = {
        'Security Deposit': { clause: 'Security Deposit Terms', severity: 'critical' },
        'Notice Period': { clause: 'Notice Period', severity: 'critical' },
        'Maintenance': { clause: 'Maintenance Responsibility', severity: 'critical' },
        'Lock-in Period': { clause: 'Lock-in Period', severity: 'medium' },
        'Rent Increase': { clause: 'Rent Escalation Terms', severity: 'medium' },
        'Exit Conditions': { clause: 'Exit/Handover Conditions', severity: 'critical' },
        'Damage Terms': { clause: 'Damage Deduction Guidelines', severity: 'medium' }
      };

      aiMissingClauses.forEach(missing => {
        const mapped = clauseMapping[missing] || { clause: missing, severity: 'medium' };
        if (mapped) {
          missingClauses.push({
            clause: mapped.clause,
            severity: mapped.severity,
            issue: `${mapped.clause} not clearly defined`,
            fix: `Add ${mapped.clause} clause for better legal protection`
          });
        }
      });

      // Calculate present clauses based on AI score
      if (aiScore >= 70) {
        presentClauses.push(
          { clause: 'Basic Rent Terms', confidence: 'high' },
          { clause: 'Party Information', confidence: 'high' }
        );
      }
      if (aiScore >= 80) {
        presentClauses.push({ clause: 'Property Details', confidence: 'high' });
      }

      totalScore = aiScore;
      maxPossibleScore = 100;
    }

    // Calculate final score (normalized to 100)
    let finalScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 65;
    
    // Safety net: ensure score is never literally 0 unless it's genuinely perfectly terrible, but default to safe median.
    if (finalScore === 0) finalScore = 65;
    
    console.log('DEBUG: Score calculation:', { totalScore, maxPossibleScore, finalScore });

    // Determine risk level based on score and critical gaps
    const missingCritical = missingClauses.filter(c => c.severity === 'critical').length;
    console.log('DEBUG: Critical gaps:', missingCritical);
    
    let riskLevel = agreement.riskLevel || fallbackRiskLevel;
    
    if (!riskLevel) {
      if (missingCritical > 0 || finalScore < 75) {
        riskLevel = 'High';
      } else if (finalScore >= 90) {
        riskLevel = 'Low';
      } else {
        riskLevel = 'Medium';
      }
    }

    // Determine summary type and message
    let summaryType, summaryMessage;
    if (finalScore >= 90 && missingCritical === 0) {
      summaryType = 'excellent';
      summaryMessage = 'Excellent agreement quality! Your agreement covers all key protections.';
    } else if (finalScore >= 75) {
      summaryType = 'good';
      summaryMessage = 'Your agreement is mostly strong, but a few clauses can be improved.';
    } else if (finalScore >= 60) {
      summaryType = 'fair';
      summaryMessage = 'Your agreement has some important gaps that need attention.';
    } else {
      summaryType = 'poor';
      summaryMessage = 'Your agreement has significant risks and needs improvements.';
    }

    console.log('DEBUG: Final analysis:', {
      score: finalScore,
      riskLevel,
      summaryType,
      summaryMessage,
      presentClauses: presentClauses.length,
      missingClauses: missingClauses.length,
      weakClauses: weakClauses.length,
      criticalGaps: missingCritical
    });

    // Create single final analysis object
    const finalAnalysis = {
      score: finalScore,
      riskLevel: riskLevel,
      summaryType: summaryType,
      summaryMessage: summaryMessage,
      isStrong: finalScore >= 90 && missingCritical === 0,
      presentClauses: presentClauses,
      missingClauses: missingClauses,
      weakClauses: weakClauses,
      strongClauses: presentClauses.map(c => c.clause),
      strongCount: presentClauses.length,
      totalIssues: missingClauses.length + weakClauses.length,
      criticalGaps: missingCritical
    };

    console.log('DEBUG: Final analysis object:', finalAnalysis);
    console.log('DEBUG: Missing clauses:', missingClauses);
    console.log('DEBUG: Weak clauses:', weakClauses);
    console.log('DEBUG: Strong clauses:', presentClauses);
    console.log('DEBUG: Suggestions count:', finalAnalysis.totalIssues);
    return finalAnalysis;
  };

  // Generate meaningful improvement suggestions based on actual analysis
  const generateImprovementSuggestions = (analysis) => {
    const suggestions = [];
    
    // Process missing critical clauses
    analysis.missingClauses
      .filter(clause => clause.severity === 'critical')
      .forEach(clause => {
        suggestions.push({
          category: 'Critical Protection',
          priority: 'high',
          issue: clause.clause,
          whyItMatters: getWhyItMatters(clause.clause),
          suggestedFix: clause.fix,
          sampleClause: getSampleClause(clause.clause)
        });
      });

    // Process missing high-risk clauses
    analysis.missingClauses
      .filter(clause => clause.severity === 'high')
      .forEach(clause => {
        suggestions.push({
          category: 'Important Protection',
          priority: 'high',
          issue: clause.clause,
          whyItMatters: getWhyItMatters(clause.clause),
          suggestedFix: clause.fix,
          sampleClause: getSampleClause(clause.clause)
        });
      });

    // Process weak clauses
    analysis.weakClauses.forEach(clause => {
      suggestions.push({
        category: 'Enhancement',
        priority: 'medium',
        issue: clause.clause,
        whyItMatters: getWhyItMatters(clause.clause),
        suggestedFix: clause.fix,
        sampleClause: getSampleClause(clause.clause)
      });
    });

    return suggestions;
  };

  // Get why clause matters
  const getWhyItMatters = (clause) => {
    const reasons = {
      'Security Deposit Terms': 'Without clear deposit terms, you may face disputes over refund amounts and timelines during move-out.',
      'Security Deposit Refund Timeline': 'A specific refund timeline prevents landlords from delaying deposit returns indefinitely.',
      'Notice Period': 'Clear notice periods protect both parties from sudden termination and ensure proper transition.',
      'Lock-in Period': 'Lock-in terms provide stability but need clear conditions for early termination.',
      'Maintenance Responsibility': 'Unclear maintenance responsibilities lead to disputes over repair costs.',
      'Rent Escalation Terms': 'Without escalation caps, landlords could increase rent arbitrarily.',
      'Late Payment Penalty': 'Late payment clauses ensure timely rent collection and define consequences.',
      'Damage Deduction Guidelines': 'Clear damage terms prevent unfair deductions and provide transparency.',
      'Exit/Handover Conditions': 'Proper exit procedures ensure smooth property handover and prevent conflicts.',
      'Landlord Information': 'Complete landlord information is legally required for agreement validity.',
      'Tenant Information': 'Complete tenant details are essential for legal identification.',
      'Property Address': 'Specific property details prevent confusion and legal disputes.',
      'Rent Amount': 'Clear rent terms are fundamental to any rental agreement.',
      'Security Deposit Amount': 'Deposit amount must be clearly specified for legal protection.',
      'Lease Start Date': 'Start date defines when rights and obligations begin.',
      'Lease Duration': 'Clear lease duration prevents ambiguity about agreement term.',
      'Water Bill Responsibility': 'Utility responsibility prevents payment disputes.',
      'Gas Bill Responsibility': 'Gas bill terms avoid conflicts over payment obligations.'
    };
    
    return reasons[clause] || 'This clause provides important legal protection and clarity for both parties.';
  };

  // Get sample clause text
  const getSampleClause = (clause) => {
    const samples = {
      'Security Deposit Terms': `SECURITY DEPOSIT:
The Tenant shall deposit with the Landlord a sum of Rs. [Amount] as security deposit, refundable without interest upon termination of this agreement, subject to deduction of any amounts due for unpaid rent, damages beyond normal wear and tear, or other breaches of terms.`,
      
      'Security Deposit Refund Timeline': `DEPOSIT REFUND:
The Landlord shall refund the full security deposit within fifteen (15) days from the date of vacating the premises, after deducting any amounts due for damages or unpaid rent. An itemized list of deductions, if any, shall be provided within ten (10) days of vacating.`,
      
      'Notice Period': `NOTICE PERIOD:
Either party may terminate this agreement by giving thirty (30) days written notice to the other party. Notice shall be served by registered post or email and shall specify the date of termination. All obligations under this agreement shall continue until the termination date.`,
      
      'Lock-in Period': `LOCK-IN PERIOD:
This agreement shall be locked for a period of eleven (11) months from the commencement date. During the lock-in period, neither party shall terminate this agreement except for breach of terms. Early termination during lock-in shall require payment of two (2) months' rent as penalty.`,
      
      'Maintenance Responsibility': `MAINTENANCE AND REPAIRS:
The Tenant shall be responsible for minor repairs and routine maintenance, including replacement of light bulbs, plumbing minor leaks, and regular cleaning. The Landlord shall be responsible for major structural repairs, electrical system issues, and plumbing system repairs beyond minor leaks.`,
      
      'Rent Escalation Terms': `RENT ESCALATION:
The Landlord may increase the rent after completion of twelve (12) months from the commencement date. Any such increase shall not exceed ten percent (10%) of the existing rent and shall be communicated to the Tenant at least sixty (60) days prior to the effective date.`,
      
      'Late Payment Penalty': `LATE PAYMENT:
If the Tenant fails to pay rent on or before the due date, a late fee of two percent (2%) per month shall be charged on the outstanding amount. Rent not paid within fifteen (15) days of due date shall be considered a breach of this agreement.`,
      
      'Damage Deduction Guidelines': `DAMAGE ASSESSMENT:
Upon termination, the Landlord shall inspect the premises within forty-eight (48) hours of vacating. Deductions shall only be made for damages beyond normal wear and tear, including broken fixtures, holes in walls, stained carpets, or damaged appliances. A detailed list with estimated repair costs shall be provided to the Tenant.`,
      
      'Exit/Handover Conditions': `VACATING AND HANDOVER:
Upon termination, the Tenant shall vacate the premises on or before the termination date, hand over peaceful possession, return all keys, and leave the premises in clean and undamaged condition. The Landlord shall conduct a joint inspection and provide a handover report.`,
      
      'Landlord Information': `LANDLORD DETAILS:
Name: [Landlord Name]
Address: [Landlord Address]
Aadhaar: [Landlord Aadhaar]
PAN: [Landlord PAN]`,
      
      'Tenant Information': `TENANT DETAILS:
Name: [Tenant Name]
Permanent Address: [Tenant Address]
Aadhaar: [Tenant Aadhaar]
Phone: [Tenant Phone]`,
      
      'Property Address': `PROPERTY DETAILS:
Address: [Complete Property Address]
Type: [Property Type]
Floor: [Floor Number]
Furnishing: [Furnishing Status]`,
      
      'Rent Amount': `RENT TERMS:
Monthly Rent: Rs. [Amount]/-
Due Date: [Day of Month]
Payment Method: [Payment Method]`,
      
      'Security Deposit Amount': `SECURITY DEPOSIT:
Amount: Rs. [Amount]/-
Purpose: Security for performance of terms
Refundable: Yes, subject to deductions`,
      
      'Lease Start Date': `COMMENCEMENT:
This agreement shall commence from [Start Date] and shall remain in force for the duration specified herein.`,
      
      'Lease Duration': `TERM:
This agreement shall be for a period of [Duration] months, commencing from [Start Date] and terminating on [End Date].`,
      
      'Water Bill Responsibility': `WATER CHARGES:
Water charges shall be [Included in rent/Payable by Tenant/Payable by Landlord] as per actual consumption.`,
      
      'Gas Bill Responsibility': `GAS CHARGES:
Gas charges shall be [Included in rent/Payable by Tenant/Payable by Landlord] as per actual consumption.`
    };
    
    return samples[clause] || `Add clear ${clause.toLowerCase()} terms to protect both parties and prevent disputes.`;
  };

  
  
  // Handle copy to clipboard
  const handleCopyClause = (template) => {
    navigator.clipboard.writeText(template);
  };

  // Generate review data when modal opens
  useEffect(() => {
    if (open && agreement && shouldShowButton(agreement)) {
      generateReviewData(agreement);
    }
  }, [open, agreement]);

  if (!shouldShowButton(agreement)) {
    return null;
  }

  const getRiskColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'warning': return 'warning';
      case 'medium': return 'warning';
      case 'info': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getWeaknessColor = (type) => {
    switch (type) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          width: '100%'
        }
      }}
    >
      <ModalErrorBoundary key={errorBoundaryKey} retry={handleRetry}>
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Gavel />
          <Typography variant="h6">Review & Improve Agreement</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
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
          const qualityLevel = getQualityLevel(
            reviewData.unifiedReview.score,
            reviewData.unifiedReview.riskLevel,
            reviewData.unifiedReview.strongCount
          );
          const config = QUALITY_CONFIG[qualityLevel];

          return (
            <Stack spacing={3}>
              {config.banner.show && (
                <Alert severity={config.banner.type}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {config.banner.message}
                  </Typography>
                  <Typography variant="body2">
                        Score: {reviewData.unifiedReview.score}/100 | Risk: {reviewData.unifiedReview.riskLevel}
                        {reviewData.unifiedReview.totalIssues  > 0 && ` | Issues: ${reviewData.unifiedReview.totalIssues}`}
                        {reviewData.unifiedReview.criticalGaps > 0 && ` | Critical Gaps: ${reviewData.unifiedReview.criticalGaps}`}
                  </Typography>
                </Alert>
              )}

              {config.qualityCard.show && (
                <Alert severity="success">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {config.qualityCard.message}
                  </Typography>
                  <Typography variant="body2">
                        Score: {reviewData.unifiedReview.score}/100 | Risk: {reviewData.unifiedReview.riskLevel} | Strong Clauses: {reviewData.unifiedReview.strongCount}
                  </Typography>
                </Alert>
              )}

              {/* Agreement Analysis Summary - Always shown */}
              <Card sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
              }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Agreement Analysis Summary
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label={`Score: ${reviewData.unifiedReview.score}/100`}
                      color={
                        reviewData.unifiedReview.score >= 85 ? 'success' : 
                        reviewData.unifiedReview.score >= 70 ? 'info' : 
                        reviewData.unifiedReview.score >= 60 ? 'warning' : 'error'
                      }
                      icon={<TrendingUp />}
                    />
                    <Chip 
                      label={`Risk: ${reviewData.unifiedReview.riskLevel}`}
                      color={
                        reviewData.unifiedReview.riskLevel === 'Low' ? 'success' : 
                        reviewData.unifiedReview.riskLevel === 'Medium' ? 'warning' : 'error'
                      }
                      icon={<Warning />}
                    />
                    <Chip 
                      label={`${reviewData.unifiedReview.strongClauses.length} Strong Clauses`}
                      color={
                        reviewData.unifiedReview.strongClauses.length >= 5 ? 'success' : 
                        reviewData.unifiedReview.strongClauses.length >= 3 ? 'warning' : 'error'
                      }
                      icon={<CheckCircle />}
                    />
                    {reviewData.unifiedReview.totalIssues > 0 && (
                      <Chip 
                        label={`${reviewData.unifiedReview.totalIssues} Issues`}
                        color={reviewData.unifiedReview.criticalGaps > 0 ? 'error' : 'warning'}
                        icon={<Error />}
                      />
                    )}
                  </Box>
                  
                  {reviewData.unifiedReview.strongClauses.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Strong Clauses Detected:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {reviewData.unifiedReview.strongClauses.map((clause, index) => (
                          <Chip 
                            key={index}
                            label={clause}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* IMPROVEMENT SECTION */}
              {config.improvementSection.show && (reviewData.suggestions.length > 0 || reviewData.improvedClauses.length > 0) && (
              <Box sx={{ position: 'relative', borderRadius: 2 }}>
                <Box>
                  <Stack spacing={3}>
                    {/* Improvement Suggestions - Only show when improvement section is shown */}
                    {config.improvementSection.show && reviewData.suggestions.length > 0 && (
                      <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Lightbulb color="info" />
                      Improvement Suggestions ({reviewData.suggestions.length})
                    </Typography>
                    
                    <Stack spacing={2}>
                      {reviewData.suggestions.map((suggestion, index) => (
                        <Card key={index} sx={{ 
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                        }}>
                          <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Chip 
                                label={suggestion.category}
                                size="small"
                                color={suggestion.priority === 'high' ? 'error' : suggestion.priority === 'medium' ? 'warning' : 'info'}
                              />
                              <Chip 
                                label={suggestion.priority}
                                size="small"
                                variant="outlined"
                              />
                            </Box>
                            
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                              Issue: {suggestion.issue}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Why it matters:</strong> {suggestion.whyItMatters}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Suggested fix:</strong> {suggestion.suggestedFix}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* Suggested Legal Wording - Only show when improvement section is shown */}
              {config.improvementSection.show && reviewData.improvedClauses.length > 0 && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Description color="success" />
                      Suggested Legal Wording ({reviewData.improvedClauses.length})
                    </Typography>
                    
                    <Stack spacing={2}>
                      {reviewData.improvedClauses.map((clause, index) => (
                        <Accordion key={index}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {clause.title}
                              </Typography>
                              <Chip 
                                label={clause.category}
                                size="small"
                                color="success"
                              />
                              <Tooltip title="Copy clause">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleCopyClause(clause.template)}
                                  sx={{ ml: 'auto', color: 'success.main' }}
                                >
                                  <ContentCopy />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                              Usage: {clause.usage}
                            </Typography>
                            
                            <Box sx={{ 
                              bgcolor: 'background.paper',
                              p: 2,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider'
                            }}>
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                                {clause.template}
                              </Typography>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
              </Stack>
              </Box>
            )}
            </Stack>
          );
        })()}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
      </ModalErrorBoundary>
    </Dialog>
  );
}
