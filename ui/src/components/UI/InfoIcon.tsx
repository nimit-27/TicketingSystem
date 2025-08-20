import React, { useState } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { IconComponent } from './IconButton/CustomIconButton';
export interface InfoIconProps {
  content?: React.ReactNode;
  text?: string;
  title?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ content, text, title }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div 
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <IconComponent
        icon='infoOutlined'
        style={{ cursor: 'pointer' }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        disableRestoreFocus
        PaperProps={{ sx: { pointerEvents: 'none', p: 1 } }}
      >
        <Box onMouseEnter={handleOpen} onMouseLeave={handleClose}>
          {title && (
            <Typography variant="subtitle2" gutterBottom>
              {title}
            </Typography>
          )}
          {text && (
            <Typography variant="body2" gutterBottom>
              {text}
            </Typography>
          )}
          {content ? (
            content
          ) : (
            <Typography color="error">Something went wrong!</Typography>
          )}
        </Box>
      </Popover>
    </div>
  );
};

export default InfoIcon;
