import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const uploadAndAnalyze = async (file, metadata = {}) => {
  const storage = getStorage();
  const db = getFirestore();
  const auth = getAuth();

  try {
    console.log("=== uploadAndAnalyze STARTED ===");
    console.log("File:", file?.name);
    console.log("Metadata:", metadata);
    console.log("Timestamp:", new Date().toISOString());
    
    // Validate inputs
    if (!file) {
      throw new Error("No file provided");
    }
    
    // CRITICAL: Get current user and validate
    const currentUser = auth.currentUser;
    console.log("Current user from auth.currentUser:", currentUser?.uid);
    console.log("Metadata userId:", metadata.userId);
    
    if (!currentUser) {
      throw new Error("No authenticated user found. Please sign in and try again.");
    }
    
    if (!metadata.userId) {
      console.log("WARNING: metadata.userId is missing, using currentUser.uid");
      metadata.userId = currentUser.uid;
    }
    
    // Verify we have the correct userId
    if (currentUser.uid !== metadata.userId) {
      console.log("WARNING: userId mismatch, using currentUser.uid");
      metadata.userId = currentUser.uid;
    }
    
    console.log("Final userId to use:", metadata.userId);
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    
    // Create upload path: agreements/{userId}/{fileName}
    const uploadPath = `agreements/${metadata.userId}/${fileName}`;
    
    console.log("Generated upload path:", uploadPath);
    
    // Step 1: Upload file to Firebase Storage
    const storageRef = ref(storage, uploadPath);
    console.log("Step 1: Uploading to Firebase Storage...");
    
    const uploadResult = await uploadBytes(storageRef, file);
    console.log("Step 1: Upload completed:", uploadResult);
    
    // Step 2: Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Step 2: Download URL obtained:", downloadURL);
    
    // Step 3: Prepare Firestore document with ALL required fields
    const agreementData = {
      title: metadata.title || file.name.replace('.pdf', ''),
      fileName: file.name,
      fileURL: downloadURL,  // Direct download URL
      storagePath: uploadPath,  // Storage reference path
      userId: metadata.userId,  // CRITICAL: User who uploaded
      createdAt: serverTimestamp(),  // Server timestamp
      fileSize: file.size,
      fileType: file.type,
      status: "active"
    };
    
    console.log("=== PREPARING TO SAVE TO FIRESTORE ===");
    console.log("Complete agreement data to save:");
    console.log("- Title:", agreementData.title);
    console.log("- FileName:", agreementData.fileName);
    console.log("- FileURL:", agreementData.fileURL);
    console.log("- StoragePath:", agreementData.storagePath);
    console.log("- UserId:", agreementData.userId);
    console.log("- CreatedAt:", agreementData.createdAt);
    console.log("- FileSize:", agreementData.fileSize);
    console.log("- FileType:", agreementData.fileType);
    console.log("- Status:", agreementData.status);
    
    // Step 4: Save to Firestore
    console.log("Step 3: Saving to Firestore...");
    
    const docRef = await addDoc(collection(db, "agreements"), agreementData);
    console.log("=== FIRESTORE SAVE SUCCESS ===");
    console.log("Document saved with ID:", docRef.id);
    console.log("Document path:", docRef.path);
    
    return {
      success: true,
      docId: docRef.id,
      downloadURL,
      agreementData,
      storagePath: uploadPath
    };
    
  } catch (error) {
    console.error("=== UPLOAD ERROR ===");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    
    // Detailed error handling
    let errorMessage = "Upload failed";
    
    if (error.code === "permission-denied") {
      errorMessage = "Permission denied. You don't have permission to save this agreement.";
    } else if (error.code === "unauthenticated") {
      errorMessage = "Authentication required. Please sign in and try again.";
    } else if (error.code === "unavailable") {
      errorMessage = "Service unavailable. Please check your connection and try again.";
    } else if (error.code === "deadline-exceeded") {
      errorMessage = "Request timeout. Please try again.";
    } else if (error.message.includes("permission")) {
      errorMessage = "Permission denied. Please check your account permissions.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error("Final error message:", errorMessage);
    throw new Error(errorMessage);
  }
};
