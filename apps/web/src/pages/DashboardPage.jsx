import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs, getDoc, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, where, onSnapshot, getFirestore } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  Stack, 
  Typography, 
  IconButton, 
  Tooltip,
  Container,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  alpha,
  useTheme
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StorageIcon from "@mui/icons-material/Storage";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FilterListIcon from "@mui/icons-material/FilterList";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import LightbulbIcon from "@mui/icons-material/Lightbulb"; // Add Lightbulb icon import
import { auth, db, storage } from "../lib/firebase.js";
import { useAuth } from "../state/AuthProvider.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { fetchAgreements, normalizeAgreement } from "../dashboardService";
import ReviewImproveModal from "../components/ReviewImproveModal.jsx";
import PaymentButton from "../components/PaymentButton.jsx";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const theme = useTheme();
  
  const [agreements, setAgreements] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [invites, setInvites] = useState([]);
  const [busyInviteId, setBusyInviteId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [filterType, setFilterType] = useState("all");
  
  // Review & Improve modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);

  // Function to view agreement
  const handleView = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Review & Improve button visibility logic
  const shouldShowReviewButton = (agreement) => {
    if (!agreement) return false;
    return (
      (agreement.score && agreement.score < 90) ||
      agreement.riskLevel === 'Medium' ||
      agreement.riskLevel === 'High'
    );
  };

  // Handle Review & Improve button click
  const handleReviewImprove = (agreement) => {
    setSelectedAgreement(agreement);
    setReviewModalOpen(true);
  };

  // Handle modal close
  const handleCloseReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedAgreement(null);
  };

  // Handle download improvement summary
  const handleDownloadSummary = async () => {
    if (!selectedAgreement) return;
    
    try {
      // Generate improvement summary PDF
      const JsPDFClass = window.jspdf?.jsPDF;
      if (!JsPDFClass) {
        alert('PDF library not available');
        return;
      }

      const doc = new JsPDFClass('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 20;
      const contentWidth = pageWidth - (marginLeft * 2);

      let yPosition = 0;

      // --- 1. HEADER BANNER ---
      doc.setFillColor(30, 58, 138); // Deep Blue bg
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('RentShield', marginLeft, 25);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Agreement Quality Report', pageWidth - marginLeft, 25, { align: 'right' });
      
      yPosition = 60;

      // Helper function for text with wrapping
      const drawWrappedText = (text, x, y, width, lineHeight) => {
        const lines = doc.splitTextToSize(text, width);
        doc.text(lines, x, y);
        return lines.length * lineHeight;
      };

      // --- 2. AGREEMENT METADATA (Shaded Box) ---
      doc.setFillColor(243, 244, 246); // Light Gray
      doc.roundedRect(marginLeft, yPosition, contentWidth, 35, 3, 3, 'F');
      
      doc.setTextColor(31, 41, 55); // Dark text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(selectedAgreement.title || 'Untitled Agreement', marginLeft + 5, yPosition + 10);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const analysisDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Analysis Date: ${analysisDate}`, marginLeft + 5, yPosition + 20);
      
      // Score Badge next to metadata box
      const score = selectedAgreement.score || 0;
      let scoreColor = [220, 38, 38]; // Red
      if (score >= 85) scoreColor = [22, 163, 74]; // Green
      else if (score >= 60) scoreColor = [202, 138, 4]; // Yellow
      
      doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.roundedRect(pageWidth - marginLeft - 45, yPosition + 5, 40, 25, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('QUALITY SCORE', pageWidth - marginLeft - 25, yPosition + 13, { align: 'center' });
      doc.setFontSize(18);
      doc.text(`${score}/100`, pageWidth - marginLeft - 25, yPosition + 23, { align: 'center' });

      yPosition += 50;

      // Section drawing helper
      const drawSection = (title, items, iconColor, emptyMessage) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 30;
        }

        // Section Title
        doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(title, marginLeft, yPosition);
        
        // Underline
        doc.setDrawColor(iconColor[0], iconColor[1], iconColor[2]);
        doc.setLineWidth(0.5);
        doc.line(marginLeft, yPosition + 2, marginLeft + 50, yPosition + 2);
        
        yPosition += 12;
        
        doc.setTextColor(55, 65, 81);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        if (!items || items.length === 0) {
          doc.setTextColor(156, 163, 175);
          doc.text(emptyMessage, marginLeft + 5, yPosition);
          yPosition += 10;
        } else {
          items.forEach((item, i) => {
            if (yPosition > pageHeight - 30) {
              doc.addPage();
              yPosition = 30;
            }
            // Bullet point
            doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
            doc.circle(marginLeft + 2, yPosition - 1.5, 1, 'F');
            
            // Text
            let itemText = typeof item === 'string' ? item : (item.clause || item.issue || JSON.stringify(item));
            const textHeight = drawWrappedText(itemText, marginLeft + 8, yPosition, contentWidth - 10, 5);
            yPosition += textHeight + 5;
          });
        }
        yPosition += 5;
      };

      // --- 3. SECTIONS ---
      // Critical Missing
      const missing = selectedAgreement.missingClauses || [];
      drawSection(`Missing & Critical Clauses (${missing.length})`, missing, [220, 38, 38], 'No critical missing clauses detected. Great job!');

      // Weak Clauses
      const weak = selectedAgreement.weakClauses || [];
      drawSection(`Areas for Improvement (${weak.length})`, weak, [234, 179, 8], 'No significant weak clauses detected.');

      // Strong Clauses
      const strong = selectedAgreement.strongClauses || [];
      drawSection(`Strong Provisions (${strong.length})`, strong, [22, 163, 74], 'Ensure basic clauses are well-defined.');

      // --- 4. FOOTER ---
      const addFooter = () => {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFillColor(243, 244, 246);
          doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
          
          doc.setTextColor(156, 163, 175);
          doc.setFontSize(9);
          doc.text('RentShield - Secure & Compliant Rental Management', pageWidth / 2, pageHeight - 6, { align: 'center' });
          doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginLeft, pageHeight - 6, { align: 'right' });
        }
      };

      addFooter();

      // --- 5. SAVE ---
      const safeTitle = (selectedAgreement.title || 'Agreement').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `RentShield_Audit_${safeTitle}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('Error generating summary PDF:', error);
      alert('Failed to generate professional summary PDF');
    }
  };

  const viewAgreement = async (agreement) => {
    try {
      if (!agreement?.storagePath) {
        alert("No file available for this agreement");
        return;
      }
      
      const storageRef = ref(storage, agreement.storagePath);
      const url = await getDownloadURL(storageRef);
      // Don't auto-open, just get the URL for manual use
      console.log("File URL retrieved:", url);
    } catch (error) {
      console.error("Error viewing agreement:", error);
      alert("Failed to open file");
    }
  };

  // Function to download agreement
  const downloadAgreement = async (agreement) => {
    try {
      if (!agreement?.fileURL && !agreement?.storagePath) {
        alert("No file available for this agreement");
        return;
      }
      
      let url = agreement.fileURL;
      if (!url && agreement.storagePath) {
        const storageRef = ref(storage, agreement.storagePath);
        url = await getDownloadURL(storageRef);
      }
      
      const link = document.createElement("a");
      link.href = url;
      link.download = agreement.fileName || "agreement.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading agreement:", error);
      alert("Failed to download file");
    }
  };

  // Function to fetch agreements with real-time listener
  const fetchUserAgreements = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();

    if (!user) {
      console.log("User not ready, skipping fetch");
      return;
    }

    console.log("Fetching agreements for user:", user.uid);

    const q = query(
      collection(db, "agreements"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Filtered agreements:", data);
      setAgreements(data);
    });

    return () => unsubscribe();
  };

  // Function to raise issue for an agreement
  const handleRaiseIssue = (a) => {
    console.log("Using docId:", a.docId);
    console.log("Full agreement object:", a);
    
    if (!a?.docId) {
      console.error("No docId found in agreement object");
      return;
    }
    
    const url = `/raise-dispute/${a.docId}`;
    console.log("Opening URL:", url);
    window.open(url, "_blank");
  };

  // Function to view dispute details
  const handleViewDispute = (disputeId) => {
    window.open(`/disputes/${disputeId}`, "_blank");
  };

  const deleteAgreement = async (agreementId) => {
    try {
      console.log("Attempting to delete agreement:", agreementId);
      console.log("Current user UID:", user?.uid);
      
      // Check if user is authenticated
      if (!user?.uid) {
        console.error("User not authenticated");
        alert("Please sign in to delete agreements.");
        return;
      }
      
      // Remove from local state immediately for better UX
      setAgreements(prev => prev.filter(a => a.id !== agreementId));
      
      const agreementRef = doc(db, "agreements", agreementId);
      await deleteDoc(agreementRef);
      
      console.log("Agreement deleted successfully:", agreementId);
      alert("Agreement deleted successfully!");
    } catch (error) {
      console.error("Error deleting agreement:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // Refresh agreements list to restore state if deletion failed
      const data = await fetchAgreements(user?.uid);
      const normalizedData = (data || []).map(normalizeAgreement);
      setAgreements(normalizedData);
      
      let errorMessage = "Failed to delete agreement. Please try again.";
      
      if (error.code === "permission-denied") {
        errorMessage = "Permission denied. This might be a data issue - try refreshing the page.";
      } else if (error.code === "not-found") {
        errorMessage = "Agreement not found. It may have already been deleted.";
      } else if (error.code === "unauthenticated") {
        errorMessage = "Authentication error. Please sign in again.";
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const acceptInvite = async (invite) => {
    if (!user) return;
    setBusyInviteId(invite.id);
    try {
      if (invite?.type === "agreement" && invite.agreementId) {
        await setDoc(
          doc(db, "agreements", invite.agreementId),
          { participants: { [user.uid]: true }, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } else {
        await setDoc(
          doc(db, "invites", invite.id),
          { status: "accepted", acceptedAt: serverTimestamp() },
          { merge: true }
        );
      }
      setInvites(invites.filter(i => i.id !== invite.id));
    } catch (error) {
      console.error("Error accepting invite:", error);
    } finally {
      setBusyInviteId("");
    }
  };

  // Load agreements on component mount and when user changes
  useEffect(() => {
    if (!user?.uid) {
      console.log("User not ready, skipping fetch");
      return;
    }

    console.log("Fetching agreements for user:", user.uid);

    const q = query(
      collection(db, "agreements"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Filtered agreements:", data);
      setAgreements(data);
    }, (error) => {
      console.error("Firebase query error:", error);
      console.error("Error code:", error.code);
    });

    return () => unsubscribe();
  }, [user?.uid]);

// ... (rest of the code remains the same)
  // Fetch user profile data for RentScore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          // The profile state is already managed by useAuth, so we don't need to set it here
          console.log("User profile data loaded:", userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const reputation = useMemo(() => profile?.reputationScore ?? 600, [profile]);
  const role = useMemo(() => profile?.role ?? "unknown", [profile]);

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const thisMonthUploads = agreements.filter(a => {
      const createdAt = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      return createdAt >= thisMonth;
    }).length;
    
    const totalStorageUsed = agreements.reduce((total, agreement) => {
      return total + (agreement.fileSize || 0);
    }, 0);

    return {
      totalAgreements: agreements.length,
      thisMonthUploads,
      totalStorageUsedMB: (totalStorageUsed / (1024 * 1024)).toFixed(1),
    };
  }, [agreements]);

  // Filter and sort agreements
  const filteredAgreements = useMemo(() => {
    return agreements
      .filter(agreement => {
        const matchesSearch = agreement.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               agreement.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === "all" || 
          (filterType === "recent" && 
           ((agreement.createdAt?.toDate ? agreement.createdAt.toDate() : new Date(agreement.createdAt)) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          );
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        if (sortBy === "latest") {
          return dateB - dateA;
        } else {
          return dateA - dateB;
        }
      });
  }, [agreements, searchTerm, sortBy, filterType]);

  const notifications = useMemo(() => {
    const list = [];
    if (!profile?.role) list.push("Choose a role in your profile to unlock tailored workflows.");
    if (agreements.length === 0) list.push("Upload your first agreement to start tracking compliance.");
    if (disputes.length === 0) list.push("No disputes yet—great. Keep records organized just in case.");
    if (invites.length > 0) list.push(`You have ${invites.length} pending invite(s) to review.`);
    return list.slice(0, 3);
  }, [profile, agreements.length, disputes.length, invites.length]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* RENTSCORE SUMMARY CARD */}
        <Card sx={{
          background: 'linear-gradient(135deg, #1565C0, #1E3A8A)',
          color: 'white',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 30px rgba(21,101,192,0.3)' }
        }}>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    My RentScore
                  </Typography>
                  <Typography variant="h2" sx={{ fontSize: { xs: '3rem', md: '4rem' }, fontWeight: 900 }}>
                    {profile?.rentScore || 'N/A'}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Based on {profile?.totalReviews || 0} ratings
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Score badge: {profile?.rentScore >= 90 ? 'Excellent' : profile?.rentScore >= 75 ? 'Good' : profile?.rentScore >= 60 ? 'Average' : 'Needs Improvement'}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    RentScore Overview
                  </Typography>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 120 }}>
                        Overall Score
                      </Typography>
                      <Typography variant="body2" sx={{ ml: 'auto' }}>
                        {profile?.rentScore || 0}/100
                      </Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}>
                      <Box sx={{ width: `${profile?.rentScore || 0}%`, height: '100%', backgroundColor: 'white', borderRadius: 2 }} />
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/profile/${user?.uid}`)}
                      sx={{
                        backgroundColor: 'white',
                        color: '#1565C0',
                        fontWeight: 600,
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                      }}
                    >
                      My Public Profile
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard')}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        fontWeight: 600,
                        '&:hover': { 
                          borderColor: 'white',
                          backgroundColor: 'rgba(255,255,255,0.1)' 
                        }
                      }}
                    >
                      Dashboard
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "text.primary", mb: 1 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your rental agreements and documents
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/intent')}
            sx={{ mt: 2, textTransform: "none" }}
          >
            Change Intent
          </Button>
        </Box>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
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

      {/* TOP STATS SECTION */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={4}>
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 3,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <InsertDriveFileIcon sx={{ fontSize: 32, color: "primary.main", mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                  Total Agreements
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main" }}>
                {stats.totalAgreements}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All uploaded documents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={4}>
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.04),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              borderRadius: 3,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 32, color: "success.main", mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                  This Month Uploads
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "success.main" }}>
                {stats.thisMonthUploads}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                New agreements this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} lg={4}>
          <Card
            sx={{
              backgroundColor: alpha(theme.palette.info.main, 0.04),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              borderRadius: 3,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StorageIcon sx={{ fontSize: 32, color: "info.main", mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                  Total Storage Used
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", color: "info.main" }}>
                {stats.totalStorageUsedMB} MB
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Across all documents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SEARCH + SORT BAR */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort by"
                >
                  <MenuItem value="latest">Latest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Filter"
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="recent">Recent (30 days)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => {
                    setSearchTerm("");
                    setSortBy("latest");
                    setFilterType("all");
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* RESULTS COUNT */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body1" color="text.secondary">
          Showing {filteredAgreements.length} of {agreements.length} agreements
        </Typography>
      </Box>

      {/* EMPTY STATE */}
      {filteredAgreements.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 3,
          }}
        >
          <FolderOpenIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: "medium", color: "text.primary", mb: 1 }}>
            {agreements.length === 0 ? "No agreements uploaded yet" : "No agreements found"}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {agreements.length === 0 
              ? "Upload your first rental agreement to get started with tracking and management."
              : "Try adjusting your search or filters to find what you're looking for."
            }
          </Typography>
          {agreements.length === 0 && (
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={() => navigate("/upload")}
              sx={{ borderRadius: 2 }}
            >
              Upload Your First Agreement
            </Button>
          )}
        </Paper>
      ) : (
        /* MODERN SAAS AGREEMENT CARDS */
        <Grid container spacing={3}>
          {filteredAgreements.map((agreement) => (
            <Grid item xs={12} sm={6} lg={4} key={agreement.id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    transform: "translateY(-4px)",
                  },
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* File icon and name */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                    <DescriptionIcon sx={{ fontSize: 24, color: "primary.main", mr: 2, mt: 0.5 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1rem",
                          lineHeight: 1.2,
                          mb: 0.5,
                        }}
                      >
                        {agreement.fileName || agreement.title || "Untitled Agreement"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.75rem",
                        }}
                      >
                        {agreement.createdAt?.toDate ? 
                          agreement.createdAt.toDate().toLocaleDateString() + " at " + agreement.createdAt.toDate().toLocaleTimeString()
                          : new Date(agreement.createdAt).toLocaleDateString() + " at " + new Date(agreement.createdAt).toLocaleTimeString()
                        }
                      </Typography>
                    </Box>
                  </Box>

                  {/* Divider */}
                  <Divider sx={{ mb: 2 }} />

                  {/* Agreement Insights */}
                  <Box sx={{ mb: 2 }}>
                    {/* Score */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.875rem",
                        mb: 0.5,
                      }}
                    >
                      Score: {agreement.score || "N/A"}/100
                    </Typography>
                    
                    {/* Risk Level */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.875rem",
                        mb: 0.5,
                        color: 
                          agreement.riskLevel === "High" ? "error.main" :
                          agreement.riskLevel === "Medium" ? "warning.main" :
                          agreement.riskLevel === "Low" ? "success.main" :
                          "text.secondary",
                        fontWeight: agreement.riskLevel ? "medium" : "normal"
                      }}
                    >
                      Risk: {agreement.riskLevel || "N/A"}
                    </Typography>
                    
                    {/* Missing Clauses */}
                    {agreement.missingClauses && agreement.missingClauses.length > 0 && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.875rem",
                          color: "text.secondary",
                        }}
                      >
                        Missing: {agreement.missingClauses.join(", ")}
                      </Typography>
                    )}
                  </Box>

                  {/* Bottom section - file size and actions */}
                  <Box sx={{ mt: "auto" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.875rem",
                        }}
                      >
                        {agreement.fileSize ? `${(agreement.fileSize / (1024 * 1024)).toFixed(2)} MB` : "Unknown size"}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      display: "flex", 
                      gap: 1.5,
                      flexWrap: "wrap",
                      alignItems: "center"
                    }}>
                      <Button
                        size="medium"
                        variant="outlined"
                        color="primary"
                        onClick={() => viewAgreement(agreement)}
                        startIcon={<VisibilityIcon />}
                        sx={{ 
                          fontSize: "0.875rem", 
                          fontWeight: 500,
                          py: 1,
                          px: 2,
                          borderRadius: 2,
                          minWidth: 100,
                          height: 42,
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            transform: "translateY(-1px)",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        View
                      </Button>
                      <Button
                        size="medium"
                        variant="contained"
                        color="primary"
                        onClick={() => downloadAgreement(agreement)}
                        startIcon={<DownloadIcon />}
                        sx={{ 
                          fontSize: "0.875rem", 
                          fontWeight: 500,
                          py: 1,
                          px: 2,
                          borderRadius: 2,
                          minWidth: 100,
                          height: 42,
                          "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                            transform: "translateY(-1px)",
                            boxShadow: theme.shadows[4],
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        Download
                      </Button>
                      {shouldShowReviewButton(agreement) && (
                        <Button
                          size="medium"
                          variant="contained"
                          color="secondary"
                          onClick={() => handleReviewImprove(agreement)}
                          startIcon={<LightbulbIcon />}
                          sx={{ 
                            fontSize: "0.875rem", 
                            fontWeight: 600,
                            py: 1,
                            px: 2,
                            borderRadius: 2,
                            minWidth: 140,
                            height: 42,
                            backgroundColor: theme.palette.secondary.main,
                            "&:hover": {
                              backgroundColor: theme.palette.secondary.dark,
                              transform: "translateY(-1px)",
                              boxShadow: theme.shadows[4],
                            },
                            transition: "all 0.2s ease-in-out",
                          }}
                        >
                          Review & Improve
                        </Button>
                      )}
                      <Button
                        size="medium"
                        variant="outlined"
                        color="error"
                        onClick={() => deleteAgreement(agreement.id)}
                        startIcon={<DeleteIcon />}
                        sx={{ 
                          fontSize: "0.875rem", 
                          fontWeight: 500,
                          py: 1,
                          px: 2,
                          borderRadius: 2,
                          minWidth: 100,
                          height: 42,
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.error.main, 0.04),
                            transform: "translateY(-1px)",
                          },
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
      
      {/* Review & Improve Modal */}
      <ReviewImproveModal
        open={reviewModalOpen}
        onClose={handleCloseReviewModal}
        agreement={selectedAgreement}
        onDownloadSummary={handleDownloadSummary}
      />
  </Container>
  );
}

export default DashboardPage;
