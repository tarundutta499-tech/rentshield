import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0B3D91" },
    secondary: { main: "#0E7C66" },
    background: { default: "#F7F8FA", paper: "#FFFFFF" }
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji"'
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true }
    }
  }
});

export function AppThemeProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

