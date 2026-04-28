import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useAuth } from "../state/AuthProvider.jsx";

export function UploadAgreementPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Clear messages
  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log("File selected:", selectedFile.name, selectedFile.type, selectedFile.size);
      setFile(selectedFile);
      clearMessages();
    }
  };

  // Complete upload function
  const handleUpload = async () => {
    console.log("=== Starting Upload Process ===");
    
    // Clear previous messages
    clearMessages();
    setBusy(true);
    setProgress(0);

    try {
      // 1. Authentication Check
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      console.log("Auth check:", { currentUser: currentUser?.uid, user: user?.uid });
      
      if (!currentUser || !user) {
        setError("You must be logged in to upload files. Please sign in and try again.");
        setBusy(false);
        setProgress(0);
        return;
      }

      // 2. File Validation
      if (!file) {
        setError("Please select a PDF file to upload.");
        setBusy(false);
        setProgress(0);
        return;
      }

      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed. Please select a PDF file.");
        setBusy(false);
        setProgress(0);
        return;
      }

      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 50) {
        setError(`File size (${fileSizeMB.toFixed(1)}MB) exceeds 50MB limit.`);
        setBusy(false);
        setProgress(0);
        return;
      }

      if (!title || title.trim() === "") {
        setError("Please enter an agreement title.");
        setBusy(false);
        setProgress(0);
        return;
      }

      console.log("Validations passed. Starting upload...");
      setProgress(20);

      // 3. Firebase Storage Upload
      const storage = getStorage();
      const db = getFirestore();
      
      // Create upload path: agreements/{userId}/{fileName}
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const uploadPath = `agreements/${currentUser.uid}/${fileName}`;
      
      console.log("Upload path:", uploadPath);
      
      const storageRef = ref(storage, uploadPath);
      setProgress(40);

      // Upload file to Firebase Storage
      console.log("Uploading to Firebase Storage...");
      const uploadResult = await uploadBytes(storageRef, file);
      console.log("Upload completed:", uploadResult);
      
      setProgress(70);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL obtained:", downloadURL);
      
      setProgress(85);

      // 4. Save to Firestore
      console.log("Saving to Firestore...");
      const agreementData = {
        title: title.trim(),
        fileName: file.name,
        fileURL: downloadURL,
        storagePath: uploadPath,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        fileSize: file.size,
        fileType: file.type,
        status: "active"
      };

      const docRef = await addDoc(collection(db, "agreements"), agreementData);
      console.log("Document saved with ID:", docRef.id);
      
      setProgress(100);
      setSuccess(`Agreement "${title}" uploaded successfully! (${fileSizeMB.toFixed(1)}MB)`);
      
      // Reset form
      setTitle("");
      setFile(null);
      setProgress(0);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (error) {
      console.error("Upload error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      // Detailed error handling
      let errorMessage = "Upload failed. Please try again.";
      
      if (error.code === "storage/unauthorized") {
        errorMessage = "Permission denied. You don't have permission to upload files.";
      } else if (error.code === "storage/canceled") {
        errorMessage = "Upload was cancelled.";
      } else if (error.code === "storage/retry-limit-exceeded") {
        errorMessage = "Upload failed due to network issues. Please check your connection and try again.";
      } else if (error.message.includes("network")) {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message.includes("permission")) {
        errorMessage = "Permission denied. Please check your account permissions.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setProgress(0);
      
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Upload Agreement
          </Typography>
          <Typography color="text.secondary">
            Upload a rental agreement PDF to get started with tracking and dispute resolution.
          </Typography>
        </Box>

        {/* Messages */}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        {/* Upload Form */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Title Input */}
              <TextField
                label="Agreement Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={busy}
                fullWidth
                required
              />

              {/* File Input */}
              <Box>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  disabled={busy}
                  style={{ display: "none" }}
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={busy}
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                  >
                    Choose PDF File
                  </Button>
                </label>
                
                {file && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: <strong>{file.name}</strong> ({(file.size / (1024 * 1024)).toFixed(1)}MB)
                  </Typography>
                )}
              </Box>

              {/* Progress Bar */}
              {progress > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Upload Progress: {progress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}

              {/* Upload Button */}
              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={busy || !file || !title}
                type="button"
                sx={{ py: 1.5 }}
              >
                {busy ? "Uploading..." : "Upload Agreement"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Upload Instructions
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                • Only PDF files are supported
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Maximum file size: 50MB
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • You must be logged in to upload files
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Files are stored securely in your personal folder
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
