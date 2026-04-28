import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const fixAgreementOwnership = async () => {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error("No authenticated user found");
    return { success: false, error: "User not authenticated" };
  }
  
  try {
    console.log("Fixing agreement ownership for user:", user.uid);
    
    // Only try to fix agreements that might belong to this user
    // We'll use a broader approach since we can't query by missing fields easily
    const agreementsRef = collection(db, "agreements");
    const querySnapshot = await getDocs(agreementsRef);
    
    let fixedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    querySnapshot.forEach(async (document) => {
      const agreementData = document.data();
      const agreementId = document.id;
      
      // Only try to fix agreements that could belong to this user
      // Check if user is mentioned in any way in the agreement
      const couldBelongToUser = 
        !agreementData.createdByUid || // No owner set
        agreementData.createdByUid === user.uid || // Already owned by user
        agreementData.userId === user.uid || // Matches userId field
        (agreementData.counterpartyEmail && agreementData.counterpartyEmail === user.email) // Matches email
        || agreementData.participants?.[user.uid]; // Already a participant
      
      if (couldBelongToUser) {
        try {
          const agreementRef = doc(db, "agreements", agreementId);
          await updateDoc(agreementRef, {
            createdByUid: user.uid,
            participants: {
              ...agreementData.participants,
              [user.uid]: true
            },
            updatedAt: new Date().toISOString()
          });
          
          console.log(`Fixed agreement ${agreementId}: ${agreementData.title || 'Untitled'}`);
          fixedCount++;
        } catch (error) {
          console.error(`Error fixing agreement ${agreementId}:`, error);
          if (error.code === 'permission-denied') {
            skippedCount++;
            console.log(`Skipped agreement ${agreementId} due to permissions`);
          } else {
            errorCount++;
          }
        }
      }
    });
    
    console.log(`Ownership fix complete. Fixed: ${fixedCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);
    return { success: true, fixedCount, skippedCount, errorCount };
    
  } catch (error) {
    console.error("Error fixing agreement ownership:", error);
    return { success: false, error: error.message };
  }
};
