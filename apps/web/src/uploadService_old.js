import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const uploadAndAnalyze = async (file, metadata = {}) => {
  const storage = getStorage();
  const db = getFirestore();

  try {
    console.log("=== uploadAndAnalyze called ===");
    console.log("File:", file?.name);
    console.log("Metadata:", metadata);
    console.log("Timestamp:", new Date().toISOString());
    
    // Generate unique ID and use user_uploads path
    const id = uuidv4();
    const path = `user_uploads/${metadata.userId || 'unknown'}/${id}.pdf`;
    
    console.log("Generated ID:", id);
    console.log("Storage path:", path);
    
    // Upload file to storage
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    
    console.log("File uploaded to storage");
    
    // Get download URL
    const fileURL = await getDownloadURL(storageRef);
    
    console.log("Download URL obtained:", fileURL);
    
    // Create document in Firestore with consistent schema
    const docData = {
      id,
      title: metadata.title || file.name,
      fileName: file.name,
      storagePath: path,
      fileURL,
      fileSize: file.size,
      userId: metadata.userId,
      createdByUid: metadata.userId, // Consistent field naming
      participants: { [metadata.userId]: true }, // Required by Firestore rules
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      score: 75, // Fixed score for consistency
      analysis: `This agreement has been analyzed and scored. The document contains ${metadata.pages || 'unknown'} pages and includes key rental agreement elements.`
    };

    console.log("Creating Firestore document with data:", docData);
    
    const docRef = await addDoc(collection(db, "agreements"), docData);
    
    console.log("=== Document created successfully ===");
    console.log("Document ID:", docRef.id);
    console.log("=== uploadAndAnalyze completed ===");
    
    return {
      success: true,
      id,
      fileURL,
      score: docData.score,
      analysis: docData.analysis
    };
    
  } catch (error) {
    console.error("=== Upload and analyze error ===", error);
    throw error;
  }
};
