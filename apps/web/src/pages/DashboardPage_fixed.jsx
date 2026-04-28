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

  console.log("=== Dashboard Component Rendered ===");
  console.log("Auth user:", user?.uid);
  console.log("Agreements count:", agreements.length);

  // Fetch agreements from Firestore
  useEffect(() => {
    if (!user) {
      console.log("No user found, skipping fetch");
      setLoading(false);
      return;
    }

    console.log("Starting to fetch agreements for user:", user.uid);
    setLoading(true);
    setError("");

    const db = getFirestore();
    const auth = getAuth();

    try {
      // Create query to fetch user's agreements
      const agreementsQuery = query(
        collection(db, "agreements"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      console.log("Query created:", agreementsQuery);

      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(
        agreementsQuery,
        (snapshot) => {
          console.log("Firestore snapshot received");
          console.log("Documents count:", snapshot.docs.length);
          
          const agreementsData = snapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Document data:", {
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

          console.log("Processed agreements:", agreementsData);
          setAgreements(agreementsData);
          setLoading(false);
        },
        (error) => {
          console.error("Firestore error:", error);
          setError(`Failed to load agreements: ${error.message}`);
          setLoading(false);
        }
      );

      // Cleanup subscription
      return () => {
        console.log("Unsubscribing from Firestore");
        unsubscribe();
      };

    } catch (error) {
      console.error("Query setup error:", error);
      setError(`Failed to setup query: ${error.message}`);
      setLoading(false);
    }
  }, [user]);

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

  // Handle delete agreement
  const handleDeleteAgreement = async (agreement) => {
    if (!window.confirm(`Are you sure you want to delete "${agreement.title}"? This action cannot be undone.`)) {
      return;
    }

    console.log("Deleting agreement:", agreement.id);
    setBusyId(agreement.id);

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "agreements", agreement.id));
      console.log("Agreement deleted successfully");
    } catch (error) {
      console.error("Error deleting agreement:", error);
      alert("Failed to delete agreement");
    } finally {
      setBusyId(null);
    }
  };

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
            User ID: {user?.uid}<br />
            Agreements Count: {agreements.length}<br />
            Sample Data: {JSON.stringify(agreements[0] || {}, null, 2)}
          </Alert>
        )}

        {/* Empty State */}
        {agreements.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "grey.50" }}>
            <Description sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No agreements yet
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
                          <Tooltip title="Delete Agreement">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteAgreement(agreement)}
                              disabled={busyId === agreement.id}
                              sx={{ color: "error.main" }}
                            >
                              <Delete />
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
