import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Chip, CircularProgress, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import { useApi } from '../hooks/useApi';
import { getChangeRequestById } from '../services/TicketCrService';

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const datePart = date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const timePart = date.toLocaleTimeString();
  return `${datePart}, ${timePart}`;
};

const statusColor = (crStatusColor?: string) => crStatusColor || '#94A3B8';

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

  if (!ticketCrId) return <Alert severity="error">Invalid CR Id.</Alert>;

  if (pending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 260 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (!changeRequest?.ticketCrId) {
    return <Alert severity="warning">No CR ticket data found for {ticketCrId}.</Alert>;
  }

  return (
    <Box className="container" sx={{ py: 2 }}>
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1.5}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Chip color="primary" label={changeRequest.ticketCrId || '-'} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {changeRequest.subject || 'CR Ticket'}
                </Typography>
              </Stack>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary">Subject</Typography>
              <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                {changeRequest.subject || '-'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">Description</Typography>
              <Typography
                variant="body1"
                sx={{ mt: 0.75, whiteSpace: 'pre-wrap', lineHeight: 1.65, backgroundColor: '#F8FAFC', p: 1.5, borderRadius: 1.5 }}
              >
                {changeRequest.description || '-'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Details</Typography>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">CR Id</Typography>
                <Typography variant="body2">{changeRequest.ticketCrId || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">CR Status</Typography>
                <Stack direction="row" alignItems="center" spacing={1} mt={0.4}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: statusColor(changeRequest.color), border: '1px solid #CBD5E1' }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{changeRequest.crStatusName || '-'}</Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Ticket Status</Typography>
                <Typography variant="body2">{changeRequest.statusName || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Requested By</Typography>
                <Typography variant="body2">{changeRequest.requestedBy || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                <Typography variant="body2">{changeRequest.assignedTo || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Assigned By</Typography>
                <Typography variant="body2">{changeRequest.assignedBy || '-'}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Remarks</Typography>
                <Typography variant="body2">{changeRequest.remarks || '-'}</Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Audit</Typography>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">Created By</Typography>
                <Typography variant="body2">{changeRequest.createdBy || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">{createdOnText}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Updated By</Typography>
                <Typography variant="body2">{changeRequest.updatedBy || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">{updatedOnText}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ViewCrTicket;
