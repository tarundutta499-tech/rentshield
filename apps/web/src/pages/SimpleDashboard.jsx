import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Container
} from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

const SimpleDashboard = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgreements = async () => {
    try {
      const q = query(
        collection(db, "agreements"),
        where("createdByUid", "==", auth.currentUser?.uid)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setAgreements(data);
    } catch (error) {
      console.error("Error fetching agreements:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (auth.currentUser?.uid) {
      fetchAgreements();
    } else {
      setLoading(false);
    }
  }, [auth.currentUser?.uid]);

  const handleRaiseIssue = (a) => {
    if (!a?.docId) {
      console.error("No docId found");
      return;
    }
    window.open(`/raise-dispute/${a.docId}`, "_blank");
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography variant="body1">Loading agreements...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          📋 Your Agreements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your rental agreements and disputes
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {agreements.map((a) => (
          <Grid item xs={12} md={6} key={a.docId}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {a.agreementTitle || 'Untitled Agreement'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {a.fileName || 'No file'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained"
                    onClick={() => window.open(`/raise-dispute/${a.docId}`, "_blank")}
                  >
                    Raise Issue
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => window.open('/disputes', '_blank')}
                  >
                    View Disputes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      </Container>
  );
};

export default SimpleDashboard;
