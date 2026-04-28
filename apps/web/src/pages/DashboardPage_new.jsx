import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { Box, Button, Card, CardContent, Grid, List, ListItem, ListItemButton, ListItemText, Stack, Typography, IconButton, Tooltip, Chip, Paper, TextField, InputAdornment } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import FilterIcon from "@mui/icons-material/FilterList";
import DescriptionIcon from "@mui/icons-material/Description";
import GavelIcon from "@mui/icons-material/Gavel";
import ShieldIcon from "@mui/icons-material/GppGood";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { db, storage } from "../lib/firebase.js";
import { useAuth } from "../state/AuthProvider.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { fetchAgreements, normalizeAgreement } from "../dashboardService";

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [invites, setInvites] = useState([]);
  const [busyInviteId, setBusyInviteId] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Function to view agreement
  const handleView = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const viewAgreement = async (agreement) => {
    try {
      if (!agreement?.storagePath) {
        alert("No file available for this agreement");
        return;
      }
      
      const storageRef = ref(storage, agreement.storagePath);
      const url = await getDownloadURL(storageRef);
      window.open(url, "_blank", "noopener,noreferrer");
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
      
      let url;
      if (agreement.fileURL) {
        url = agreement.fileURL;
      } else if (agreement.storagePath) {
        const storageRef = ref(storage, agreement.storagePath);
        url = await getDownloadURL(storageRef);
      }
      
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error downloading agreement:", error);
      alert("Failed to download file");
    }
  };

  // Function to delete agreement
  const deleteAgreement = async (agreement) => {
    if (!window.confirm("Are you sure you want to delete this agreement? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "agreements", agreement.id));
      setAgreements(prev => prev.filter(a => a.id !== agreement.id));
    } catch (error) {
      console.error("Error deleting agreement:", error);
      alert("Failed to delete agreement");
    }
  };

  // Function to raise dispute
  const raiseDispute = (agreementId) => {
    navigate(`/raise-dispute/${agreementId}`);
  };

  // Function to view disputes
  const viewDisputes = () => {
    navigate("/disputes");
  };

  // Function to handle invite
  const handleInvite = async (inviteId, action) => {
    setBusyInviteId(inviteId);
    try {
      // Handle invite logic here
      alert(`${action} invite handled`);
    } catch (error) {
      console.error("Error handling invite:", error);
      alert("Failed to handle invite");
    } finally {
      setBusyInviteId("");
    }
  };

  // Filter agreements based on search and status
  const filteredAgreements = useMemo(() => {
    return agreements.filter(agreement => {
      const matchesSearch = agreement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agreement.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filterStatus === "all") return matchesSearch;
      if (filterStatus === "active") return matchesSearch && agreement.status === "active";
      if (filterStatus === "pending") return matchesSearch && agreement.status === "pending";
      
      return matchesSearch;
    });
  }, [agreements, searchTerm, filterStatus]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load agreements
        const agreementsQuery = query(
          collection(db, "agreements"),
          where("userId", "==", user?.uid),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const agreementsSnapshot = await getDocs(agreementsQuery);
        const agreementsData = agreementsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          docId: doc.id
        }));
        setAgreements(agreementsData.map(normalizeAgreement));

        // Load disputes
        const disputesQuery = query(
          collection(db, "disputes"),
          where("userId", "==", user?.uid),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        const disputesSnapshot = await getDocs(disputesQuery);
        const disputesData = disputesSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          docId: doc.id
        }));
        setDisputes(disputesData);

        // Load invites (mock data for now)
        setInvites([
          { id: "1", from: "landlord@example.com", type: "new_agreement", status: "pending" },
          { id: "2", from: "tenant@example.com", type: "dispute_resolution", status: "pending" }
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadData();
  }, [user, refreshKey]);

  // Memoized stats
  const stats = useMemo(() => ({
    totalAgreements: agreements.length,
    activeDisputes: disputes.filter(d => d.status === "active").length,
    pendingInvites: invites.filter(i => i.status === "pending").length
  }), [agreements, disputes, invites]);

  return (
    <div style={{ padding: "24px", backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>
          Protect Your Rent. Avoid Disputes. Build Your Rental Reputation.
        </h1>
        <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>
          Welcome back! Here's what's happening with your agreements today.
        </p>
        
        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <Button 
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate("/upload")}
            sx={{ borderRadius: 2 }}
          >
            Upload Agreement
          </Button>
          <Button 
            variant="outlined"
            startIcon={<GavelIcon />}
            onClick={viewDisputes}
            sx={{ borderRadius: 2 }}
          >
            View Disputes ({stats.activeDisputes})
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "16px", 
        marginBottom: "32px" 
      }}>
        <StatCard
          title="Total Agreements"
          value={stats.totalAgreements}
          icon="📋"
          color="#1976d2"
        />
        <StatCard
          title="Active Disputes"
          value={stats.activeDisputes}
          icon="⚖️"
          color="#f44336"
        />
        <StatCard
          title="Pending Invites"
          value={stats.pendingInvites}
          icon="📧"
          color="#ff9800"
        />
      </div>

      {/* Search and Filter */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            placeholder="Search agreements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "#666" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: "300px",
              backgroundColor: "white",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px"
              }
            }}
          />
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <FilterIcon style={{ color: "#666", marginRight: "4px" }} />
            <Typography variant="body2" color="text.secondary">
              Filter:
            </Typography>
            <Chip
              label="All"
              color={filterStatus === "all" ? "primary" : "default"}
              onClick={() => setFilterStatus("all")}
              size="small"
            />
            <Chip
              label="Active"
              color={filterStatus === "active" ? "primary" : "default"}
              onClick={() => setFilterStatus("active")}
              size="small"
            />
            <Chip
              label="Pending"
              color={filterStatus === "pending" ? "primary" : "default"}
              onClick={() => setFilterStatus("pending")}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Agreements Grid */}
      {filteredAgreements.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", backgroundColor: "white" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>
            No agreements found
          </h3>
          <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
            {searchTerm ? "Try adjusting your search terms" : "Upload your first agreement to get started with tracking and analysis."}
          </p>
          <Button 
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => navigate("/upload")}
            sx={{ borderRadius: 2 }}
          >
            Upload Your First Agreement
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredAgreements.map((agreement) => (
            <Grid item xs={12} md={6} lg={4} key={agreement.id}>
              <Card sx={{ 
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                transition: "box-shadow 0.2s",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transform: "translateY(-2px)"
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: "600", color: "#1a1a1a", mb: 1 }}>
                        {agreement.title || "Untitled Agreement"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "14px" }}>
                        {agreement.fileName || "No file"}
                      </Typography>
                      {agreement.agreementType && (
                        <Chip 
                          label={agreement.agreementType}
                          size="small" 
                          sx={{ mt: 1, backgroundColor: "#e3f2fd", color: "white" }}
                        />
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Tooltip title="View Agreement">
                        <IconButton 
                          onClick={() => viewAgreement(agreement)}
                          size="small"
                          sx={{ color: "#1976d2" }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Agreement">
                        <IconButton 
                          onClick={() => downloadAgreement(agreement)}
                          size="small"
                          sx={{ color: "#1976d2" }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Agreement">
                        <IconButton 
                          onClick={() => deleteAgreement(agreement)}
                          size="small"
                          sx={{ color: "#f44336" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Description */}
                  {agreement.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {agreement.description}
                    </Typography>
                  )}

                  {/* Status and Actions */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                    <div>
                      <Typography variant="body2" color="text.secondary">
                        Status: <strong>{agreement.status || "Active"}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Created: {new Date(agreement.createdAt?.toDate()).toLocaleDateString()}
                      </Typography>
                    </div>
                    <Button 
                      variant="contained"
                      startIcon={<GavelIcon />}
                      onClick={() => raiseDispute(agreement.id)}
                      sx={{ borderRadius: 2 }}
                    >
                      Raise Dispute
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pending Invites Section */}
      {invites.length > 0 && (
        <Paper sx={{ p: 3, mt: 4, backgroundColor: "white" }}>
          <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center" }}>
            <Typography variant="h6" component="span" sx={{ mr: 1 }}>
              Pending Invites
            </Typography>
            <Chip 
              label={invites.length} 
              color="primary" 
              size="small" 
            />
          </Typography>
          
          <List>
            {invites.map((invite) => (
              <ListItem key={invite.id} sx={{ border: "1px solid #e0e0e0", borderRadius: "8px", mb: 1 }}>
                <ListItemText
                  primary={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <Typography variant="subtitle2">
                          {invite.type === "new_agreement" ? "New Agreement Request" : "Dispute Resolution"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          From: {invite.from}
                        </Typography>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button 
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleInvite(invite.id, "Accept")}
                          disabled={busyInviteId === invite.id}
                        >
                          Accept
                        </Button>
                        <Button 
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleInvite(invite.id, "Decline")}
                          disabled={busyInviteId === invite.id}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {new Date(invite.createdAt?.toDate()).toLocaleDateString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
}
