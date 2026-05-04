import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress, Divider, Link, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { useApi } from '../hooks/useApi';
import { getChangeRequestById, getCrStatusWorkflowMappings, updateChangeRequestStatus } from '../services/TicketCrService';
import { getCurrentUserDetails } from '../config/config';
import GenericButton from '../components/UI/Button';
import RemarkComponent from '../components/UI/Remark/RemarkComponent';
import CrTicketHistory from '../components/CrTicketHistory';

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const datePart = date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  const timePart = date.toLocaleTimeString();
  return `${datePart}, ${timePart}`;
};

const statusColor = (crStatusColor?: string) => crStatusColor || '#94A3B8';

const normalizeAllowedActionIds = (raw: unknown): Set<string> => {
  if (Array.isArray(raw)) return new Set(raw.map((id) => String(id)));
  if (typeof raw === 'string') return new Set(raw.split('|').map((id) => id.trim()).filter(Boolean));
  return new Set<string>();
};

const ViewCrTicket: React.FC = () => {
  const { ticketCrId } = useParams<{ ticketCrId: string }>();
  const { data: changeRequest, apiHandler, pending } = useApi<any>();
  const { data: workflowMappings, apiHandler: workflowApiHandler } = useApi<Record<string, any[]>>();
  const [selectedAction, setSelectedAction] = useState<any | null>(null);

  useEffect(() => {
    if (ticketCrId) {
      void apiHandler(() => getChangeRequestById(ticketCrId));
    }
  }, [ticketCrId, apiHandler]);

  const userDetails = useMemo(() => getCurrentUserDetails(), []);
  const allowedCrActionIds = useMemo(() => normalizeAllowedActionIds(userDetails?.allowedCrStatusActionIds), [userDetails]);
  const roleList = userDetails?.role ?? [];

  useEffect(() => {
    if (!roleList.length) return;
    void workflowApiHandler(() => getCrStatusWorkflowMappings(roleList));
  }, [roleList, workflowApiHandler]);

  const actions = useMemo(() => {
    if (!changeRequest?.crStatusId) return [];
    const workflows = workflowMappings?.[changeRequest.crStatusId] || [];
    return workflows.filter((action) => allowedCrActionIds.has(String(action.crswId)));
  }, [changeRequest?.crStatusId, workflowMappings, allowedCrActionIds]);

  const handleCrActionSubmit = async (remark: string) => {
    if (!ticketCrId || !selectedAction?.crswId) return;
    await apiHandler(() => updateChangeRequestStatus(ticketCrId, {
      crswId: selectedAction.crswId,
      remarks: remark,
      updatedBy: userDetails?.userId || 'SYSTEM',
    }));
    setSelectedAction(null);
    await apiHandler(() => getChangeRequestById(ticketCrId));
  };

  const createdOnText = useMemo(() => formatDateTime(changeRequest?.createdDate), [changeRequest?.createdDate]);

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
      <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ mb: 2 }}>
              {actions.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {actions.map(action => (
                    <GenericButton
                      key={action.crswId}
                      size="small"
                      variant={action.action === 'Reject CR' ? 'outlined' : 'contained'}
                      color="success"
                      onClick={() => setSelectedAction(action)}
                    >
                      {action.action}
                    </GenericButton>
                  ))}
                </Stack>
              )}
            </Box>


              {selectedAction && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <RemarkComponent
                    open
                    actionName={selectedAction.action || 'Update CR status'}
                    onSubmit={handleCrActionSubmit}
                    onCancel={() => setSelectedAction(null)}
                  />
                </Box>
              )}

            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{changeRequest.ticketCrId || '-'}</Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: statusColor(changeRequest.color), border: '1px solid #CBD5E1' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{changeRequest.crStatusName || '-'}</Typography>
              </Stack>
            </Stack>

            <Tooltip
              placement="top-start"
              title={
                <Stack spacing={0.25}>
                  <Typography variant="caption">Status: {changeRequest.statusName || '-'}</Typography>
                  <Typography variant="caption">Created On: {createdOnText}</Typography>
                </Stack>
              }
            >
              <Link
                component={RouterLink}
                to={`/tickets/${changeRequest.ticketId}`}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                variant="body2"
                color="text.secondary"
                sx={{ display: 'inline-block', mb: 2 }}
              >
                {changeRequest.ticketId || '-'}
              </Link>
            </Tooltip>

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
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>CR History</Typography>
              <CrTicketHistory ticketCrId={ticketCrId} />
            </Box>

      </Paper>
    </Box>
  );
};

export default ViewCrTicket;
