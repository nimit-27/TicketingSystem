import React, { useState } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
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
    <div onMouseEnter={handleOpen} onMouseLeave={handleClose} style={{ display: 'inline-block' }}>
      <IconComponent
        icon='infoOutlined'
        style={{ cursor: 'pointer', color: grey[500] }}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        onMouseLeave={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        disableRestoreFocus
        PaperProps={{
          sx: {
            p: 0,
            borderRadius: 2,
            opacity: 0.9,
            transition: 'opacity 0.3s ease-in-out'
          }
        }}
      >
        <Box sx={{ p: 1, border: 1, borderRadius: 2 }}>
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
