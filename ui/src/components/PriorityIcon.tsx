import React from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Box } from '@mui/material';

export type PriorityLevel = 'low' | 'medium' | 'high';

interface Props {
  level: PriorityLevel;
}

const colors: Record<PriorityLevel, string> = {
  low: '#FDD835', // yellow
  medium: '#FB8C00', // orange
  high: '#D32F2F', // red
};

const PriorityIcon: React.FC<Props> = ({ level }) => {
  const count = level === 'low' ? 1 : level === 'medium' ? 2 : 3;
  return (
    <Box sx={{ position: 'relative', width: count * 12, height: 16 }}>
      {Array.from({ length: count }).map((_, idx) => (
        <ArrowUpwardIcon
          key={idx}
          sx={{
            position: 'absolute',
            left: idx * 6,
            fontSize: 16,
            color: colors[level],
          }}
        />
      ))}
    </Box>
  );
};

export default PriorityIcon;
