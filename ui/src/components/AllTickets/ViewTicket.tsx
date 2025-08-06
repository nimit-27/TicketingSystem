import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, TextField, MenuItem, Select, SelectChangeEvent, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { useApi } from '../../hooks/useApi';
import { getTicket, updateTicket } from '../../services/TicketService';
import { getPriorities } from '../../services/PriorityService';
import { getSeverities } from '../../services/SeverityService';

interface ViewTicketProps {
  ticketId: string | null;
  open: boolean;
  onClose: () => void;
}

const ViewTicket: React.FC<ViewTicketProps> = ({ ticketId, open, onClose }) => {
  const { data: ticket, apiHandler: getTicketHandler } = useApi<any>();
  const { apiHandler: updateTicketHandler } = useApi<any>();
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [severity, setSeverity] = useState('');
  const [recommendedSeverity, setRecommendedSeverity] = useState('');
  const [priorityOptions, setPriorityOptions] = useState<string[]>([]);
  const [severityOptions, setSeverityOptions] = useState<string[]>([]);

  useEffect(() => {
    if (open && ticketId) {
      getTicketHandler(() => getTicket(ticketId));
      getPriorities().then(res => setPriorityOptions(res.data || []));
      getSeverities().then(res => setSeverityOptions(res.data || []));
    }
  }, [open, ticketId, getTicketHandler]);

  useEffect(() => {
    if (ticket) {
      setSubject(ticket.subject || '');
      setDescription(ticket.description || '');
      setPriority(ticket.priority || '');
      setSeverity(ticket.severity || '');
      setRecommendedSeverity(ticket.recommendedSeverity || '');
    }
  }, [ticket]);

  const handleSave = () => {
    if (!ticketId) return;
    const payload = {
      subject,
      description,
      priority,
      severity,
      recommendedSeverity
    };
    updateTicketHandler(() => updateTicket(ticketId, payload)).then(() => {
      setEditing(false);
      getTicketHandler(() => getTicket(ticketId));
    });
  };

  const handleClose = () => {
    setEditing(false);
    onClose();
  };

  const renderText = (value: string, onChange: (v: string) => void, multiline?: boolean) => (
    editing ? (
      <TextField
        value={value}
        onChange={e => onChange(e.target.value)}
        variant="outlined"
        fullWidth
        multiline={multiline}
        minRows={multiline ? 3 : undefined}
        size="small"
        sx={{ mt: 1 }}
      />
    ) : (
      <Typography sx={{ mt: 1 }}>{value || '-'}</Typography>
    )
  );

  const renderSelect = (value: string, setValue: (v: string) => void, options: string[]) => (
    editing ? (
      <Select
        value={value}
        onChange={(e: SelectChangeEvent) => setValue(e.target.value as string)}
        fullWidth
        size="small"
        sx={{ mt: 1 }}
      >
        {options.map(o => (
          <MenuItem key={o} value={o}>{o}</MenuItem>
        ))}
      </Select>
    ) : (
      <Typography color="text.secondary" sx={{ mt: 1 }}>{value || '-'}</Typography>
    )
  );

  const createdInfo = ticket ? `Created by ${ticket.requestorName || ticket.userId || ''} on ${ticket.reportedDate ? new Date(ticket.reportedDate).toLocaleDateString() : ''}` : '';
  const updatedInfo = ticket ? `Updated by ${ticket.assignedBy || ''} on ${ticket.lastModified ? new Date(ticket.lastModified).toLocaleDateString() : ''}` : '';

  if (!open) return null;

  return (
    <Paper sx={{ width: 400, p: 2, height: 'calc(100vh - 70px)', position: 'relative', overflowY: 'auto', borderLeft: '1px solid', borderColor: 'divider' }}>
      <IconButton onClick={handleClose} sx={{ position: 'absolute', left: -40, top: 8 }}>
        <ChevronRightIcon />
      </IconButton>
      {ticket && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserAvatar name={ticket.assignedTo || 'NA'} size={32} />
              <Typography variant="subtitle1">{ticket.id}</Typography>
            </Box>
            <Box>
              {editing ? (
                <>
                  <IconButton size="small" onClick={() => { setEditing(false); if(ticket){ setSubject(ticket.subject||''); setDescription(ticket.description||''); setPriority(ticket.priority||''); setSeverity(ticket.severity||''); setRecommendedSeverity(ticket.recommendedSeverity||''); } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={handleSave}>
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <IconButton size="small" onClick={() => setEditing(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {ticket.category} &gt; {ticket.subCategory}
          </Typography>
          {renderText(subject, setSubject)}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            {createdInfo}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {updatedInfo}
          </Typography>
          <Box sx={{ mt: 2 }}>
            {renderText(description, setDescription, true)}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">Priority</Typography>
            {renderSelect(priority, setPriority, priorityOptions)}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Severity</Typography>
            {renderSelect(severity, setSeverity, severityOptions)}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Recommended Severity</Typography>
            {renderSelect(recommendedSeverity, setRecommendedSeverity, severityOptions)}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default ViewTicket;

