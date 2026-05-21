import React, { useRef, useState, useEffect } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
  AccountCircleOutlined, UploadFileOutlined, GavelOutlined,
  DescriptionOutlined, StarOutlined
} from '@mui/icons-material';

const iconMap = {
  AccountCircleOutlined: <AccountCircleOutlined sx={{ fontSize: 32 }} />,
  UploadFileOutlined: <UploadFileOutlined sx={{ fontSize: 32 }} />,
  GavelOutlined: <GavelOutlined sx={{ fontSize: 32 }} />,
  DescriptionOutlined: <DescriptionOutlined sx={{ fontSize: 32 }} />,
  StarOutlined: <StarOutlined sx={{ fontSize: 32 }} />,
};

export default function HowItWorksStep({ 
  number, side, icon, label, title, description, accent, delay 
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isLeft = side === 'left';

  return (
    <Box
      ref={ref}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: isLeft ? 'row' : 'row-reverse' },
        alignItems: { xs: 'flex-start', md: 'center' },
        mb: { xs: 4, md: 8 },
        gap: { xs: 2, md: 0 },
        opacity: inView ? 1 : 0,
        transform: inView
          ? 'none'
          : `translateX(${isLeft ? '-40px' : '40px'})`,
        transition: `all 0.7s ease ${delay}ms`,
      }}
    >
      {/* Card — takes up ~45% width on desktop */}
      <Box sx={{ width: { xs: '100%', md: '45%' } }}>
        <Box sx={{
          background: 'rgba(15,32,64,0.9)',
          border: `1px solid rgba(${accent === '#00D4B8' ? '0,212,184' : '245,166,35'},0.2)`,
          borderRadius: '20px',
          p: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            border: `1px solid rgba(${accent === '#00D4B8' ? '0,212,184' : '245,166,35'},0.5)`,
            boxShadow: `0 20px 40px rgba(${accent === '#00D4B8' ? '0,212,184' : '245,166,35'},0.12)` 
          }
        }}>

          {/* Decorative step number behind card */}
          <Typography sx={{
            position: 'absolute',
            top: -10,
            right: 16,
            fontFamily: "'Syne', sans-serif",
            fontSize: '100px',
            fontWeight: 900,
            color: `rgba(${accent === '#00D4B8' ? '0,212,184' : '245,166,35'},0.05)`,
            lineHeight: 1,
            pointerEvents: 'none',
            userSelect: 'none'
          }}>
            {number}
          </Typography>

          <Stack spacing={2}>
            {/* Icon + label row */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                background: `rgba(${accent === '#00D4B8' ? '0,212,184' : '245,166,35'},0.1)`,
                border: `1px solid rgba(${accent === '#00D4B8' ? '0,212,184' : '245,166,35'},0.25)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accent,
                flexShrink: 0,
                animation: inView ? 'glowPulse 2s ease-in-out infinite' : 'none'
              }}>
                {iconMap[icon]}
              </Box>
              <Typography sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: accent,
                fontWeight: 600
              }}>
                {label}
              </Typography>
            </Stack>

            {/* Title */}
            <Typography sx={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: { xs: '20px', md: '22px' },
              color: 'white',
              lineHeight: 1.2
            }}>
              {title}
            </Typography>

            {/* Description */}
            <Typography sx={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#8899AA',
              fontSize: '14px',
              lineHeight: 1.8
            }}>
              {description}
            </Typography>

            {/* Bottom accent bar */}
            <Box sx={{
              width: inView ? '60px' : '0px',
              height: '3px',
              background: `linear-gradient(90deg, ${accent}, transparent)`,
              borderRadius: '2px',
              transition: `width 0.8s ease ${delay + 400}ms` 
            }} />
          </Stack>
        </Box>
      </Box>

      {/* Center dot — desktop only */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        width: '10%',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <Box sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: accent,
          border: '4px solid #0A1628',
          boxShadow: `0 0 0 4px rgba(${accent === '#00D4B8' ? '0,212,184' : '245,166,35'},0.25)`,
          animation: inView ? 'glowPulse 2s ease-in-out infinite' : 'none',
          zIndex: 2,
          flexShrink: 0
        }} />
      </Box>

      {/* Empty spacer for opposite side — desktop only */}
      <Box sx={{ 
        display: { xs: 'none', md: 'block' },
        width: '45%' 
      }} />

    </Box>
  );
}
