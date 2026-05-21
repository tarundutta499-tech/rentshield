import React from "react";
import { Card, CardActionArea, CardContent, Typography, Box } from "@mui/material";

export default function RoleCard({ title, subtitle, selected, onClick }) {
  return (
    <Card
      elevation={selected ? 10 : 2}
      sx={{
        borderRadius: 3,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        border: selected ? "2px solid #00d4b8" : "1px solid rgba(29, 78, 216, 0.1)",
        background: selected ? "rgba(0, 212, 184, 0.08)" : "#ffffff",
        height: "100%",
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: "100%",
          p: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          textAlign: "left",
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
          }
        }}
      >
        <Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            {subtitle}
          </Typography>
        </Box>
        {selected ? (
          <Typography variant="caption" sx={{ mt: 2, color: '#00856f', fontWeight: 700 }}>
            Selected
          </Typography>
        ) : null}
      </CardActionArea>
    </Card>
  );
}
