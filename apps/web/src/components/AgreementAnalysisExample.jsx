import React, { useState } from 'react';
import AnalysisCard from './AnalysisCard.jsx';
import ReviewModal from './ReviewModal.jsx';

// Example of how to integrate the new AI-powered analysis components
export default function AgreementAnalysisExample({ agreement }) {
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleReviewClick = () => {
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
  };

  return (
    <>
      {/* Main Analysis Card - Shows score, risk, and first 2 suggestions */}
      <AnalysisCard 
        agreement={agreement}
        onReviewClick={handleReviewClick}
      />

      {/* Detailed Review Modal - Shows all issues with copy functionality */}
      <ReviewModal 
        open={reviewModalOpen}
        onClose={handleCloseReviewModal}
        analysis={analysis}
      />
    </>
  );
}

// Usage in your existing pages:
// import AgreementAnalysisExample from './components/AgreementAnalysisExample.jsx';

// // In your agreement page component:
// function AgreementPage({ agreement }) {
//   return (
//     <div>
//       {/* Your existing content */}
      
//       {/* Add the AI-powered analysis */}
//       <AgreementAnalysisExample agreement={agreement} />
      
//       {/* Your existing content */}
//     </div>
//   );
// }
