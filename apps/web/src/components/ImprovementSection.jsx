import React from 'react';
import { Box, Typography, Alert, Stack } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

export default function ImprovementSection({ heading, gaps = [], weakClauses = [], suggestions = [] }) {
  const hasContent = gaps.length > 0 || weakClauses.length > 0 || suggestions.length > 0;
  if (!hasContent) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="warning" />
        {heading}
      </Typography>
      <Stack spacing={1.5}>
        {gaps.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ErrorOutlineIcon fontSize="small" color="error" />
              Missing Clauses ({gaps.length})
            </Typography>
            <Stack spacing={1}>
              {gaps.map((gap, i) => (
                <Alert key={i} severity="error" icon={false} sx={{ py: 0.5 }}>{gap}</Alert>
              ))}
            </Stack>
          </Box>
        )}
        {weakClauses.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <WarningAmberIcon fontSize="small" color="warning" />
              Weak or Incomplete Clauses ({weakClauses.length})
            </Typography>
            <Stack spacing={1}>
              {weakClauses.map((clause, i) => (
                <Alert key={i} severity="warning" icon={false} sx={{ py: 0.5 }}>{clause}</Alert>
              ))}
            </Stack>
          </Box>
        )}
        {suggestions.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LightbulbOutlinedIcon fontSize="small" color="info" />
              Recommended Additions ({suggestions.length})
            </Typography>
            <Stack spacing={1}>
              {suggestions.map((s, i) => (
                <Alert key={i} severity="info" icon={false} sx={{ py: 0.5 }}>{s}</Alert>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
