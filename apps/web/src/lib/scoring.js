export function calculateAgreementHealth({ hasSignatures, hasDates, hasAddresses, hasRentAmount, pages }) {
  let score = 0;
  if (hasSignatures) score += 25;
  if (hasDates) score += 15;
  if (hasAddresses) score += 15;
  if (hasRentAmount) score += 25;
  if (pages >= 3) score += 10;
  if (pages >= 6) score += 10;
  return Math.max(0, Math.min(100, score));
}

export function calculateReputationScore({ onTimePaymentRate, disputesOpen, disputesClosed, agreementHealth }) {
  // Baseline 600, range ~300..900 for demo purposes.
  const pay = Math.round((onTimePaymentRate ?? 0.85) * 250); // 0..250
  const disputePenalty = Math.min(200, (disputesOpen ?? 0) * 60 + (disputesClosed ?? 0) * 20);
  const compliance = Math.round((agreementHealth ?? 0.7) * 150); // 0..150
  return Math.max(300, Math.min(900, 600 + pay + compliance - disputePenalty));
}


