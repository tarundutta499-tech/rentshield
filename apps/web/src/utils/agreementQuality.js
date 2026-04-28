export const THRESHOLDS = {
  EXCELLENT: { minScore: 90, risk: 'Low', minStrongClauses: 1 },
  GOOD:      { minScore: 75 },
  FAIR:      { minScore: 60 },
};

export function getQualityLevel(score, riskLevel, strongCount) {
  if (
    score >= THRESHOLDS.EXCELLENT.minScore &&
    riskLevel === THRESHOLDS.EXCELLENT.risk &&
    strongCount >= THRESHOLDS.EXCELLENT.minStrongClauses
  ) return 'excellent';
  if (score >= THRESHOLDS.GOOD.minScore) return 'good';
  if (score >= THRESHOLDS.FAIR.minScore) return 'fair';
  return 'poor';
}

export const QUALITY_CONFIG = {
  excellent: {
    banner:             { show: false, type: null,      message: null },
    qualityCard:        { show: true,  message: 'Excellent Agreement Quality! Your agreement includes all essential clauses and provides comprehensive legal protection.' },
    improvementSection: { show: false, heading: null },
    color:              '#4CAF50',
    icon:               'CheckCircle',
  },
  good: {
    banner:             { show: true,  type: 'warning', message: 'Your agreement is mostly strong, but a few clauses can be improved.' },
    qualityCard:        { show: false, message: null },
    improvementSection: { show: true,  heading: 'Areas That Can Be Improved' },
    color:              '#2196F3',
    icon:               'CheckCircle',
  },
  fair: {
    banner:             { show: true,  type: 'warning', message: 'Your agreement has some important gaps that should be addressed.' },
    qualityCard:        { show: false, message: null },
    improvementSection: { show: true,  heading: 'Areas Needing Improvement' },
    color:              '#FF9800',
    icon:               'Warning',
  },
  poor: {
    banner:             { show: true,  type: 'error',   message: 'Your agreement has critical missing clauses and is high risk.' },
    qualityCard:        { show: false, message: null },
    improvementSection: { show: true,  heading: 'Critical Issues Found' },
    color:              '#F44336',
    icon:               'Error',
  },
};
