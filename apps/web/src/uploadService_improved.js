import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export const uploadAndAnalyze = async (file, metadata = {}) => {
  const storage = getStorage();
  const db = getFirestore();
  const auth = getAuth();

  console.log("🚀 Starting improved upload process");
  console.log("File name:", file.name);
  console.log("File size:", file.size);
  console.log("File type:", file.type);

  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated. Please log in again.");
    }

    const userId = auth.currentUser.uid;
    console.log("User ID:", userId);

    // Generate unique ID for this upload
    const id = uuidv4();
    const timestamp = Date.now();
    const uploadPath = `agreements/${userId}/${id}_${timestamp}.pdf`;
    
    console.log("Generated upload path:", uploadPath);
    
    // Prepare Firestore document data
    const agreementData = {
      title: metadata.title || file.name.replace('.pdf', ''),
      fileName: file.name,
      fileURL: '', // Will be set after upload
      storagePath: uploadPath,
      userId: userId, // CRITICAL: User who uploaded
      createdAt: serverTimestamp(),
      fileSize: file.size,
      fileType: file.type,
      status: "uploading" // Set status to uploading first
    };

    console.log("📄 Creating Firestore document with uploading status...");
    const docRef = await addDoc(collection(db, "agreements"), agreementData);
    console.log("✅ Document created with ID:", docRef.id);

    // Step 1: Upload file to Firebase Storage with resumable upload
    const storageRef = ref(storage, uploadPath);
    console.log("📤 Starting resumable upload to Firebase Storage...");
    
    // Use resumable upload for better progress tracking
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'application/pdf',
      customMetadata: {
        userId: userId,
        docId: docRef.id,
        originalFileName: file.name
      }
    });

    // Return a promise that resolves when upload is complete
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`📊 Upload progress: ${progress.toFixed(1)}%`);
          console.log(`📊 Bytes transferred: ${snapshot.bytesTransferred}/${snapshot.totalBytes}`);
          
          // Update progress in Firestore document
          if (progress < 100) {
            // You could update progress here if needed
          }
        },
        (error) => {
          console.error("❌ Upload error:", error);
          reject(error);
        },
        () => {
          console.log("✅ Upload completed successfully!");
          
          // Step 2: Get download URL
          getDownloadURL(storageRef).then(async (downloadURL) => {
            console.log("🔗 Download URL obtained:", downloadURL);
            
            // Step 3: Update Firestore document with complete data
            const completeData = {
              ...agreementData,
              fileURL: downloadURL,
              status: "active"
            };
            
            console.log("💾 Updating Firestore document with complete data...");
            addDoc(collection(db, "agreements"), completeData).then(() => {
              console.log("✅ Upload process completed successfully!");
              
              resolve({
                success: true,
                docId: docRef.id,
                downloadURL,
                agreementData: completeData,
                storagePath: uploadPath
              });
            }).catch((updateError) => {
              console.error("❌ Error updating Firestore:", updateError);
              reject(updateError);
            });
          }).catch((urlError) => {
            console.error("❌ Error getting download URL:", urlError);
            reject(urlError);
          });
        }
      );
    });

  } catch (error) {
    console.error("❌ Upload process failed:", error);
    throw error;
  }
};
