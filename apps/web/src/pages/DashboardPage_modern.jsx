import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  LinearProgress,
  Alert,
  Stack,
  Paper,
  Tooltip,
  Chip,
  Container,
  useTheme,
  alpha,
} from "@mui/material";
import {
  CloudUpload,
  Visibility,
  Download,
  Delete,
  Description,
  FolderOpen,
} from "@mui/icons-material";
import { useAuth } from "../state/AuthProvider.jsx";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  console.log("=== Dashboard Component Rendered ===");
  console.log("Auth user from context:", user?.uid);
  console.log("Agreements count:", agreements.length);

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
        where("userId", "==", currentUser.uid),
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
          
          setAgreements(agreementsData);
          setLoading(false);
          setError("");
        },
        (error) => {
          console.error("=== Firestore Error ===");
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          
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
        window.open(agreement.fileURL, "_blank", "noopener,noreferrer");
      } else if (agreement.storagePath) {
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
        const link = document.createElement("a");
        link.href = agreement.fileURL;
        link.download = agreement.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (agreement.storagePath) {
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

  // Handle delete agreement
  const handleDeleteAgreement = async (agreement) => {
    if (!window.confirm(`Are you sure you want to delete "${agreement.title || agreement.fileName}"? This action cannot be undone.`)) {
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

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Auth loading state
  if (!authReady) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3} alignItems="center" justifyContent="center" minHeight="60vh">
          <LinearProgress sx={{ width: 200 }} />
          <Typography variant="body1" color="text.secondary">
            Checking authentication...
          </Typography>
        </Stack>
      </Container>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3} alignItems="center" justifyContent="center" minHeight="60vh">
          <LinearProgress sx={{ width: 200 }} />
          <Typography variant="body1" color="text.secondary">
            Loading agreements...
          </Typography>
        </Stack>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Your Agreements
          </Typography>
          <Alert severity="error">{error}</Alert>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
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
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: theme.shadows[2],
              "&:hover": {
                boxShadow: theme.shadows[4],
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Upload Agreement
          </Button>
        </Box>

        {/* Debug Info */}
        {process.env.NODE_ENV === "development" && (
          <Alert severity="info">
            <strong>Debug Info:</strong><br />
            Auth Ready: {authReady ? "Yes" : "No"}<br />
            User ID: {user?.uid || "None"}<br />
            Agreements Count: {agreements.length}
          </Alert>
        )}

        {/* Empty State */}
        {agreements.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 3,
            }}
          >
            <FolderOpen sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: "medium", color: "text.primary", mb: 1 }}>
              No agreements uploaded yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Upload your first rental agreement to get started with tracking and management.
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
          /* Modern Card Grid */
          <Grid container spacing={3}>
            {agreements.map((agreement) => (
              <Grid item xs={12} sm={6} lg={4} key={agreement.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      transform: "translateY(-4px)",
                    },
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}>
                    {/* TOP SECTION - File Name and Date */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          mb: 0.5,
                          lineHeight: 1.2,
                        }}
                      >
                        {agreement.title || "Untitled Agreement"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.75rem",
                        }}
                      >
                        Uploaded {agreement.createdAt.toLocaleDateString()} at {agreement.createdAt.toLocaleTimeString()}
                      </Typography>
                    </Box>

                    {/* MIDDLE SECTION - Status/Score Placeholder */}
                    <Box sx={{ mb: 2, flexGrow: 1 }}>
                      <Chip
                        label="Active"
                        size="small"
                        sx={{
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          fontWeight: 500,
                          mb: 1,
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.875rem" }}
                      >
                        {agreement.fileName || "Unknown file"}
                      </Typography>
                    </Box>

                    {/* BOTTOM SECTION - File Size and Action Buttons */}
                    <Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        >
                          {agreement.fileSize ? formatFileSize(agreement.fileSize) : "Unknown size"}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                        <Tooltip title="View File">
                          <IconButton
                            size="small"
                            onClick={() => handleViewFile(agreement)}
                            sx={{
                              color: "primary.main",
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              },
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download File">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadFile(agreement)}
                            sx={{
                              color: "primary.main",
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              },
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <Download fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Agreement">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteAgreement(agreement)}
                            disabled={busyId === agreement.id}
                            sx={{
                              color: "error.main",
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                              "&:hover": {
                                backgroundColor: alpha(theme.palette.error.main, 0.2),
                              },
                              "&:disabled": {
                                backgroundColor: alpha(theme.palette.action.disabled, 0.1),
                                color: theme.palette.action.disabled,
                              },
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
