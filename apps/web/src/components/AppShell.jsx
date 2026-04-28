import React from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShieldIcon from "@mui/icons-material/GppGood";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../state/AuthProvider.jsx";
import { MobileNavDrawer } from "./MobileNavDrawer.jsx";
import { NotificationBell } from "./NotificationBell.jsx";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "How it works", to: "/how-it-works" },
      { label: "Upload", to: "/upload", authOnly: true },
  { label: "Legal notices", to: "/legal-notice", authOnly: true },
  { label: "Dashboard", to: "/dashboard", authOnly: true }
];

export function AppShell() {
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = navItems.filter((i) => !i.authOnly || user);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar>
          {isMobile ? (
            <IconButton edge="start" onClick={() => setOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          ) : null}

          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1} 
            sx={{ flex: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <ShieldIcon color="primary" />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 800, 
                letterSpacing: -0.4,
                '&:hover': { color: 'primary.main' }
              }}
            >
              RentShield
            </Typography>
          </Stack>

          {!isMobile ? (
            <Stack direction="row" spacing={1} alignItems="center">
              {visibleItems.map((item) => (
                <Button
                  key={item.to}
                  color={location.pathname === item.to ? "primary" : "inherit"}
                  onClick={() => navigate(item.to)}
                  sx={{ fontWeight: 600 }}
                >
                  {item.label}
                </Button>
              ))}
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              {user && <NotificationBell />}
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              {user ? (
                <>
                  <Button variant="outlined" onClick={() => navigate("/profile")}>
                    Profile
                  </Button>
                  <Button onClick={signOut}>Sign out</Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => navigate("/auth")}>
                  Sign in
                </Button>
              )}
            </Stack>
          ) : (
            <Button variant="contained" onClick={() => navigate(user ? "/dashboard" : "/auth")}>
              {user ? "Dashboard" : "Sign in"}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <MobileNavDrawer
        open={open}
        onClose={() => setOpen(false)}
        items={visibleItems}
        user={user}
        onNavigate={(to) => {
          setOpen(false);
          navigate(to);
        }}
        onSignOut={() => {
          setOpen(false);
          signOut();
        }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>
      
      <div style={{ textAlign: "center", padding: "20px", marginTop: "40px" }}>
        <Link to="/terms">Terms & Conditions</Link> |{" "}
        <Link to="/privacy">Privacy Policy</Link>
      </div>
    </Box>
  );
}

