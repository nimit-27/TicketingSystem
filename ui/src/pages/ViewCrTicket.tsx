import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Chip, CircularProgress, Divider, Grid, Paper, Typography } from '@mui/material';
import { useApi } from '../hooks/useApi';
import { getChangeRequestById } from '../services/TicketCrService';

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

const ViewCrTicket: React.FC = () => {
  const { ticketCrId } = useParams<{ ticketCrId: string }>();
  const { data: changeRequest, apiHandler, pending } = useApi<any>();

  useEffect(() => {
    if (ticketCrId) {
      void apiHandler(() => getChangeRequestById(ticketCrId));
    }
  }, [ticketCrId, apiHandler]);

  const createdOnText = useMemo(() => formatDateTime(changeRequest?.createdDate), [changeRequest?.createdDate]);
  const updatedOnText = useMemo(() => formatDateTime(changeRequest?.updatedOn), [changeRequest?.updatedOn]);

  if (!ticketCrId) {
    return <Alert severity="error">Invalid CR Id.</Alert>;
  }

  if (pending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 220 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!changeRequest?.ticketCrId) {
    return <Alert severity="warning">No CR ticket data found for {ticketCrId}.</Alert>;
  }

  return (
    <Box className="container" sx={{ py: 2 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            CR Ticket Details
          </Typography>
          <Chip color="primary" label={changeRequest.ticketCrId || '-'} />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">CR Id</Typography>
            <Typography variant="body1">{changeRequest.ticketCrId || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Ticket Id</Typography>
            <Typography variant="body1">{changeRequest.ticketId || '-'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Typography variant="body1">{changeRequest.statusName || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">CR Status</Typography>
            <Typography variant="body1">{changeRequest.crStatusName || '-'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Subject</Typography>
            <Typography variant="body1">{changeRequest.subject || '-'}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">Description</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{changeRequest.description || '-'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Requested By</Typography>
            <Typography variant="body1">{changeRequest.requestedBy || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Assigned To</Typography>
            <Typography variant="body1">{changeRequest.assignedTo || '-'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Assigned By</Typography>
            <Typography variant="body1">{changeRequest.assignedBy || '-'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Remarks</Typography>
            <Typography variant="body1">{changeRequest.remarks || '-'}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Created By</Typography>
            <Typography variant="body1">{changeRequest.createdBy || '-'}</Typography>
            <Typography variant="caption" color="text.secondary">{createdOnText}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="caption" color="text.secondary">Updated By</Typography>
            <Typography variant="body1">{changeRequest.updatedBy || '-'}</Typography>
            <Typography variant="caption" color="text.secondary">{updatedOnText}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ViewCrTicket;
