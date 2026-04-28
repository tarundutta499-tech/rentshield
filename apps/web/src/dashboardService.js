import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

// Utility function to normalize agreement data
export const normalizeAgreement = (agreement) => {
  if (!agreement) return null;
  
  return {
    docId: agreement.docId || agreement.id || '',  // 🔥 Use Firestore docId first
    id: agreement.id || agreement.docId || '',    // Keep compatibility
    title: agreement.title || agreement.fileName || 'Untitled Agreement',
    fileName: agreement.fileName || '',
    fileURL: agreement.fileURL || null,
    score: agreement.score ?? null,
    healthScore: agreement.score ?? agreement.healthScore ?? null,
    analysis: agreement.analysis || '',
    storagePath: agreement.storagePath || '',
    fileSize: agreement.fileSize || 0,
    userId: agreement.userId || agreement.createdByUid || '',
    createdByUid: agreement.createdByUid || agreement.userId || '',
    counterpartyEmail: agreement.counterpartyEmail || null,
    participants: agreement.participants || {},
    createdAt: agreement.createdAt || null,
    updatedAt: agreement.updatedAt || null,
    // Ensure all required fields exist
    hasFile: !!agreement.fileURL || !!agreement.storagePath,
    hasValidData: !!(agreement.docId || agreement.id)
  };
};

export const fetchAgreements = async (userId = null) => {
  const db = getFirestore();
  
  console.log("fetchAgreements: Starting fetch for userId:", userId);
  
  if (userId) {
    // Fetch only user's agreements - CRITICAL: Use userId field to match upload
    console.log("fetchAgreements: Querying with userId filter");
    try {
      const q = query(collection(db, "agreements"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const rawAgreements = querySnapshot.docs.map((doc) => {
        return {
          docId: doc.id,        // 🔥 REAL FIRESTORE ID
          ...doc.data()
        };
      });
      
      console.log("fetchAgreements: Raw agreements data:", rawAgreements);
      
      // Normalize all agreements to ensure consistent schema
      const normalizedAgreements = rawAgreements.map(normalizeAgreement);
      
      console.log("fetchAgreements: Normalized agreements:", normalizedAgreements);
      console.log("fetchAgreements: Number of user agreements:", normalizedAgreements.length);
      
      return normalizedAgreements;
    } catch (error) {
      console.error("fetchAgreements: Error fetching agreements:", error);
      return [];
    }
  } else {
    // Fetch all agreements (admin view)
    console.log("fetchAgreements: Querying all agreements (admin view)");
    try {
      const querySnapshot = await getDocs(collection(db, "agreements"));
      
      const rawAgreements = querySnapshot.docs.map((doc) => {
        return {
          docId: doc.id,        // 🔥 REAL FIRESTORE ID
          ...doc.data()
        };
      });
      
      // Normalize all agreements to ensure consistent schema
      const normalizedAgreements = rawAgreements.map(normalizeAgreement);
      
      console.log("fetchAgreements: Normalized agreements (admin):", normalizedAgreements);
      console.log("fetchAgreements: Number of all agreements:", normalizedAgreements.length);
      
      return normalizedAgreements;
    } catch (error) {
      console.error("fetchAgreements: Error fetching all agreements:", error);
      return [];
    }
  }
};
