import React from 'react';
import { Box } from '@mui/material';
import { IconComponent } from '../IconButton/CustomIconButton';

interface PriorityIconProps {
  level: number;
}

const getColor = (level: number) => {
  if (level <= 1) return '#ffd700';
  if (level === 2) return 'orange';
  return 'red';
};

const PriorityIcon: React.FC<PriorityIconProps> = ({ level }) => {
  const count = Math.min(Math.max(level, 1), 3);
  const color = getColor(count);
  return (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        console.log({ i })
        return <IconComponent
          icon='arrowup'
          fontSize='small'
          className='priority-icon position-absolute'
          style={{ fontSize: 30, color, top: (2 - i) * 6 - 20 }}
          key={i}
        />
      })}
    </Box>
  );
};

export default PriorityIcon;
