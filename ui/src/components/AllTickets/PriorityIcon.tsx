import React from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box } from '@mui/material';

interface PriorityIconProps {
  level: number;
}

const getColor = (level: number) => {
  if (level <= 1) return 'yellow';
  if (level === 2) return 'orange';
  return 'red';
};

const PriorityIcon: React.FC<PriorityIconProps> = ({ level }) => {
  const count = Math.min(Math.max(level, 1), 3);
  const color = getColor(count);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <ArrowUpwardIcon key={i} sx={{ fontSize: 16, color, mt: i ? -0.5 : 0 }} />
      ))}
    </Box>
  );
};

export default PriorityIcon;
