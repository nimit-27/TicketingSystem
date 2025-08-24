import React from 'react';
import { Box, IconButton, Drawer } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import TicketView from '../TicketView';

interface ViewTicketProps {
  ticketId: string | null;
  open: boolean;
  onClose: () => void;
}

const ViewTicket: React.FC<ViewTicketProps> = ({ ticketId, open, onClose }) => {
  const navigate = useNavigate();
  if (!open || !ticketId) return null;
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      PaperProps={{ sx: { top: '70px', height: 'calc(100vh - 70px)' } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, pt: 1 }}>
        <IconButton onClick={onClose}>
          <ChevronRightIcon />
        </IconButton>
        <IconButton onClick={() => navigate(`/tickets/${ticketId}`)}>
          <VisibilityIcon />
        </IconButton>
      </Box>
      <TicketView ticketId={ticketId} showHistory />
    </Drawer>
  );
};

export default ViewTicket;

