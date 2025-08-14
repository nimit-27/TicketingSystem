import { Box, Rating, Typography } from '@mui/material';
import React from 'react';

const labels: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent',
};

interface StarRatingProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ label, value, onChange }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
      <Typography sx={{ width: 220 }}>{label}</Typography>
      <Rating
        value={value}
        onChange={(_, newValue) => onChange(newValue || 0)}
      />
      {value !== null && <Box sx={{ ml: 2 }}>{labels[value]}</Box>}
    </Box>
  );
};

export default StarRating;
