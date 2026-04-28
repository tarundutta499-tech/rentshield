import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const uploadAndAnalyze = async (file, metadata = {}) => {
  const storage = getStorage();
  const db = getFirestore();

  try {
    console.log("=== uploadAndAnalyze called ===");
    console.log("File:", file?.name);
    console.log("Metadata:", metadata);
    console.log("Timestamp:", new Date().toISOString());
    
    // Validate inputs
    if (!file) {
      throw new Error("No file provided");
    }
    
    if (!metadata.userId) {
      throw new Error("User ID is required");
    }
    
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    
    // Create upload path: agreements/{userId}/{fileName}
    const uploadPath = `agreements/${metadata.userId}/${fileName}`;
    
    console.log("Generated upload path:", uploadPath);
    
    // Upload file to Firebase Storage
    const storageRef = ref(storage, uploadPath);
    console.log("Uploading to Firebase Storage...");
    
    const uploadResult = await uploadBytes(storageRef, file);
    console.log("Upload completed:", uploadResult);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL obtained:", downloadURL);
    
    // Save metadata to Firestore with all required fields
    const agreementData = {
      title: metadata.title || file.name.replace('.pdf', ''),
      fileName: file.name,
      fileURL: downloadURL,  // Direct download URL
      storagePath: uploadPath,  // Storage reference path
      userId: metadata.userId,  // User who uploaded
      createdAt: serverTimestamp(),  // Server timestamp
      fileSize: file.size,
      fileType: file.type,
      status: "active"
    };
    
    console.log("Saving to Firestore with data:", agreementData);
    
    const docRef = await addDoc(collection(db, "agreements"), agreementData);
    console.log("Document saved with ID:", docRef.id);
    
    return {
      success: true,
      docId: docRef.id,
      downloadURL,
      agreementData
    };
    
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};
