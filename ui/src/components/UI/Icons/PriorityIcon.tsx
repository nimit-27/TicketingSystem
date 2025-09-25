import React from 'react';
import { Box } from '@mui/material';
import { IconComponent } from '../IconButton/CustomIconButton';
import { Popover } from 'antd';

interface PriorityIconProps {
  level: number;
  rotateRight?: boolean;
  priorityText?: string;
}

const getColor = (level: number) => {
  if (level === 4) return '#ffd700';
  if (level === 3) return 'orange';
  if (level === 2) return 'orange';
  if (level === 1) return 'red';
  return 'ffd700';
};

const PriorityIcon: React.FC<PriorityIconProps> = ({ level, rotateRight, priorityText }) => {
  // const count = Math.min(Math.max(level, 1), 4);
  const count = 5 - level; // Invert the level to match the desired display
  const color = getColor(level);
  return (
    <Popover content={priorityText} placement="top">
      <Box sx={{
        position: 'relative',
        display: 'block',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 0,
        transform: rotateRight ? 'rotate(90deg)' : 'none',
        transformOrigin: '25px',
      }}>
        {Array.from({ length: count }).map((_, i) => {
          return <IconComponent
            icon='arrowup'
            fontSize='small'
            className='priority-icon position-absolute'
            style={{ fontSize: 30, color, top: (2 - i) * 6 - 20 }}
            key={i}
          />
        })}
      </Box>
    </Popover>
  );
};

export default PriorityIcon;
