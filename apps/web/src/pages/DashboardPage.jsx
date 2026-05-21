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
  
  // Render different dashboard based on user role
  const renderRoleDashboard = () => {
    const userRole = profile?.role || profile?.userType;
    
    switch (userRole) {
      case 'tenant':
        return (
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Tenant Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your rental agreements and stay protected
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <InsertDriveFileIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h6">My Agreements</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Coming soon - View all your rental agreements
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.success.main, 0.04) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
                        <Typography variant="h6">Agreement Score</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Coming soon - Track your agreement quality
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.warning.main, 0.04) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <DescriptionIcon sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
                        <Typography variant="h6">Risk Alerts</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Coming soon - Get notified of potential issues
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.info.main, 0.04) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FolderOpenIcon sx={{ fontSize: 32, color: 'info.main', mr: 2 }} />
                        <Typography variant="h6">Documents</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Coming soon - Organize your files
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </Container>
        );
      case 'landlord':
      case 'owner':  // For backward compatibility with old userType field
        return (
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Landlord Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your properties and tenant relationships
                </Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <StorageIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                        <Typography variant="h6">My Properties</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Coming soon - Manage your rental properties
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.success.main, 0.04) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <VisibilityIcon sx={{ fontSize: 32, color: 'success.main', mr: 2 }} />
                        <Typography variant="h6">Active Tenants</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Coming soon - Track your tenants
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.warning.main, 0.04) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LightbulbIcon sx={{ fontSize: 32, color: 'warning.main', mr: 2 }} />
                        <Typography variant="h6">Agreement Status</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Coming soon - Monitor agreement status
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.info.main, 0.04) }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FilterListIcon sx={{ fontSize: 32, color: 'info.main', mr: 2 }} />
                        <Typography variant="h6">Pending Invites</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Coming soon - Review pending invitations
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          </Container>
        );
      default:
        return (
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Alert severity="warning">
              Please select your role to continue. <Button onClick={() => navigate('/select-role')}>Go to Role Selection</Button>
            </Alert>
          </Container>
        );
    }
  };
  
  // If role is not set, show role-based dashboard
  if (profile?.role) {
    return renderRoleDashboard();
  }

  // Fallback for when role is not set (should be rare due to routing)
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Alert severity="error">
        Role information is missing. Please <Button onClick={() => navigate('/select-role')}>select your role</Button> to continue.
      </Alert>
    </Container>
  );
}

export default DashboardPage;
