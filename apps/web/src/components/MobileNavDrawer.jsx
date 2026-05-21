import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";

export function MobileNavDrawer({ open, onClose, items, user, onNavigate, onSignOut }) {
  return (
    <Drawer open={open} onClose={onClose}>
      <Box sx={{ width: 320, p: 2 }}>
        <Stack spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            RentShield
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Legal-tech rental management
          </Typography>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <List dense>
          {items.map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton component={Link} to={item.to} onClick={() => onClose()}>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1}>
          {user ? (
            <>
              <Button fullWidth variant="outlined" onClick={() => onNavigate("/profile")}>
                Profile
              </Button>
              <Button fullWidth onClick={onSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Button fullWidth variant="contained" onClick={() => onNavigate("/auth")}>
              Sign in
            </Button>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}

