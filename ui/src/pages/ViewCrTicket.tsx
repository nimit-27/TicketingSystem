import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import TicketView from '../components/TicketView/TicketView';
import { useApi } from '../hooks/useApi';
import { getChangeRequestById } from '../services/TicketCrService';

const ViewCrTicket: React.FC = () => {
  const { ticketCrId } = useParams<{ ticketCrId: string }>();
  const { data: changeRequest, apiHandler } = useApi<any>();

  useEffect(() => {
    if (ticketCrId) {
      void apiHandler(() => getChangeRequestById(ticketCrId));
    }
  }, [ticketCrId, apiHandler]);

  if (!ticketCrId) {
    return <Typography>Invalid CR Id.</Typography>;
  }

  if (!changeRequest?.ticketId) {
    return <Typography>Loading change request...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>CR: {changeRequest.ticketCrId}</Typography>
      <TicketView ticketId={changeRequest.ticketId} showHistory />
    </Box>
  );
};

export default ViewCrTicket;
