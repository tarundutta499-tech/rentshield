import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Stack,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  CloudUpload,
  Visibility,
  Download,
  Delete,
  Gavel,
  Description,
} from "@mui/icons-material";
import { useAuth } from "../state/AuthProvider.jsx";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  console.log("=== Dashboard Component Rendered ===");
  console.log("Auth user from context:", user?.uid);
  console.log("Auth ready:", authReady);

  // Wait for auth to be ready
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("Auth state changed:", user?.uid);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Fetch agreements from Firestore
  useEffect(() => {
    if (!authReady) {
      console.log("Auth not ready, skipping fetch");
      return;
    }

    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    console.log("=== Starting Firestore Fetch ===");
    console.log("Auth.currentUser:", currentUser?.uid);
    console.log("Auth user from context:", user?.uid);

    if (!currentUser) {
      console.log("No authenticated user found");
      setError("Please sign in to view your agreements");
      setLoading(false);
      return;
    }

    console.log("User authenticated, fetching agreements...");
    setLoading(true);
    setError("");

    const db = getFirestore();

    try {
      // Create query to fetch user's agreements only
      const agreementsQuery = query(
        collection(db, "agreements"),
        where("userId", "==", currentUser.uid),  // Filter by logged-in user
        orderBy("createdAt", "desc")
      );

      console.log("Firestore query created:", agreementsQuery);
      console.log("Querying for userId:", currentUser.uid);

      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(
        agreementsQuery,
        (snapshot) => {
          console.log("=== Firestore Snapshot Received ===");
          console.log("Snapshot docs count:", snapshot.docs.length);
          console.log("Snapshot metadata:", snapshot.metadata);
          
          const agreementsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Document:", {
              id: doc.id,
              title: data.title,
              fileName: data.fileName,
              userId: data.userId,
              createdAt: data.createdAt
            });
            
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date()
            };
          });

          console.log("=== Processed Agreements Data ===");
          console.log("Total agreements:", agreementsData.length);
          console.log("Sample agreement:", agreementsData[0]);
          
          setAgreements(agreementsData);
          setLoading(false);
          setError("");
        },
        (error) => {
          console.error("=== Firestore Error ===");
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          console.error("Full error:", error);
          
          // Detailed error handling
          let errorMessage = "Failed to load agreements";
          
          if (error.code === "permission-denied") {
            errorMessage = "Permission denied. You don't have access to these agreements.";
          } else if (error.code === "unauthenticated") {
            errorMessage = "Please sign in to view your agreements.";
          } else if (error.code === "unavailable") {
            errorMessage = "Network error. Please check your connection.";
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          setError(errorMessage);
          setLoading(false);
        }
      );

      console.log("Firestore subscription created");

      // Cleanup subscription
      return () => {
        console.log("Unsubscribing from Firestore");
        unsubscribe();
      };

    } catch (error) {
      console.error("=== Query Setup Error ===");
      console.error("Error:", error);
      setError(`Failed to setup query: ${error.message}`);
      setLoading(false);
    }
  }, [authReady, user]);

  // Handle file view/download
  const handleViewFile = async (agreement) => {
    console.log("Viewing file:", agreement.fileName);
    
    try {
      if (agreement.fileURL) {
        // Use direct URL if available
        window.open(agreement.fileURL, "_blank", "noopener,noreferrer");
      } else if (agreement.storagePath) {
        // Get download URL from storage path
        const storage = getStorage();
        const storageRef = ref(storage, agreement.storagePath);
        const downloadURL = await getDownloadURL(storageRef);
        window.open(downloadURL, "_blank", "noopener,noreferrer");
      } else {
        alert("File not available");
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      alert("Failed to open file");
    }
  };

  // Handle file download
  const handleDownloadFile = async (agreement) => {
    console.log("Downloading file:", agreement.fileName);
    
    try {
      if (agreement.fileURL) {
        // Use direct URL if available
        const link = document.createElement("a");
        link.href = agreement.fileURL;
        link.download = agreement.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (agreement.storagePath) {
        // Get download URL from storage path
        const storage = getStorage();
        const storageRef = ref(storage, agreement.storagePath);
        const downloadURL = await getDownloadURL(storageRef);
        
        const link = document.createElement("a");
        link.href = downloadURL;
        link.download = agreement.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("File not available for download");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file");
    }
  };

  // Handle raise dispute
  const handleRaiseDispute = (agreementId) => {
    console.log("Raising dispute for agreement:", agreementId);
    navigate(`/raise-dispute/${agreementId}`);
  };

  // Auth loading state
  if (!authReady) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4">Your Agreements</Typography>
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Checking authentication...
            </Typography>
            <LinearProgress />
          </Box>
        </Stack>
      </Box>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4">Your Agreements</Typography>
          <Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Loading your agreements...
            </Typography>
            <LinearProgress />
          </Box>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4">Your Agreements</Typography>
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              Your Agreements
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {agreements.length} agreement{agreements.length !== 1 ? "s" : ""} uploaded
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => navigate("/upload")}
            sx={{ borderRadius: 2 }}
          >
            Upload New Agreement
          </Button>
        </Box>

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <Alert severity="info">
            <strong>Debug Info:</strong><br />
            Auth Ready: {authReady ? "Yes" : "No"}<br />
            User ID: {user?.uid || "None"}<br />
            Agreements Count: {agreements.length}<br />
            Sample Data: {JSON.stringify(agreements[0] || {}, null, 2)}
          </Alert>
        )}

        {/* Empty State */}
        {agreements.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "grey.50" }}>
            <Description sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No agreements found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Upload your first rental agreement to get started with tracking and dispute resolution.
            </Typography>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => navigate("/upload")}
              sx={{ borderRadius: 2 }}
            >
              Upload Your First Agreement
            </Button>
          </Paper>
        ) : (
          /* Agreements Grid */
          <Grid container spacing={3}>
            {agreements.map((agreement) => (
              <Grid item xs={12} md={6} lg={4} key={agreement.id}>
                <Card 
                  sx={{ 
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.2s",
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack spacing={2}>
                      {/* Header */}
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                          {agreement.title || "Untitled Agreement"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {agreement.fileName || "Unknown file"}
                        </Typography>
                      </Box>

                      {/* Metadata */}
                      <Stack spacing={1}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" color="text.secondary">
                            Uploaded: {agreement.createdAt.toLocaleDateString()}
                          </Typography>
                          {agreement.fileSize && (
                            <Typography variant="caption" color="text.secondary">
                              {(agreement.fileSize / (1024 * 1024)).toFixed(1)} MB
                            </Typography>
                          )}
                        </Box>
                        
                        {agreement.status && (
                          <Chip
                            label={agreement.status}
                            size="small"
                            color={agreement.status === "active" ? "success" : "default"}
                            sx={{ alignSelf: "flex-start" }}
                          />
                        )}
                      </Stack>

                      {/* Actions */}
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View File">
                            <IconButton
                              size="small"
                              onClick={() => handleViewFile(agreement)}
                              sx={{ color: "primary.main" }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download File">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadFile(agreement)}
                              sx={{ color: "primary.main" }}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <Button
                          variant="contained"
                          startIcon={<Gavel />}
                          onClick={() => handleRaiseDispute(agreement.id)}
                          sx={{ borderRadius: 2 }}
                        >
                          Raise Dispute
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
}
