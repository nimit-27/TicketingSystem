import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, TextField, MenuItem, Select, SelectChangeEvent, Drawer } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { useApi } from '../../hooks/useApi';
import { getTicket, updateTicket } from '../../services/TicketService';
import { getCurrentUserDetails } from '../../config/config';
import { getPriorities } from '../../services/PriorityService';
import { getSeverities } from '../../services/SeverityService';
import InfoIcon from '../UI/Icons/InfoIcon';
import { PriorityInfo, SeverityInfo } from '../../types';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import CommentsSection from '../Comments/CommentsSection';
import { useNavigate } from 'react-router-dom';
import Histories from '../../pages/Histories';
import CustomFieldset from '../CustomFieldset';
import { useTranslation } from 'react-i18next';
import TicketView from '../TicketView';

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
  const [priorityDetails, setPriorityDetails] = useState<PriorityInfo[]>([]);
  const [severityDetails, setSeverityDetails] = useState<SeverityInfo[]>([]);

  useEffect(() => {
    if (ticketId) {
      getTicketHandler(() => getTicket(ticketId));
      getPriorities().then(res => {
        const priorityData = Array.isArray(res?.data) ? res.data : [];
        setPriorityOptions(priorityData.map((p: PriorityInfo) => p.level));
        setPriorityDetails(priorityData);
      });
      getSeverities().then(res => {
        const severityData = Array.isArray(res?.data) ? res.data : [];
        setSeverityOptions(severityData.map((s: SeverityInfo) => s.level));
        setSeverityDetails(severityData);
      });
    }
  }, [ticketId, getTicketHandler]);

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
      recommendedSeverity,
      updatedBy: getCurrentUserDetails()?.username
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
  const navigate = useNavigate();
  const { t } = useTranslation();

  const cancelEditing = () => {
    setEditing(false);
    if (ticket) {
      setSubject(ticket.subject || '');
      setDescription(ticket.description || '');
      setPriority(ticket.priority || '');
      setSeverity(ticket.severity || '');
      setRecommendedSeverity(ticket.recommendedSeverity || '');
    }
  }

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
      <Typography sx={{ mt: 1, lineHeight: 1.66 }}>{value || '-'}</Typography>
    )
  );

  const renderSelect = (value: string, setValue: (v: string) => void, options: string[]) => (
    editing ? (
      <Select
        value={value}
        onChange={(e: SelectChangeEvent) => setValue(e.target.value as string)}
        fullWidth
        size="small"
      // sx={{ mt: 1 }}
      >
        {(Array.isArray(options) && options.length > 0) ? options.map(o => (
          <MenuItem key={o} value={o}>{o}</MenuItem>
        )) : <MenuItem key="" value="">None</MenuItem>}
      </Select>
    ) : (
      <Typography color="text.secondary" sx={{ mt: 1 }}>{value || '-'}</Typography>
    )
  );

  const createdInfo = ticket ? `Created by ${ticket.requestorName || ticket.userId || ''} on ${ticket.reportedDate ? new Date(ticket.reportedDate).toLocaleString() : ''}` : '';
  const updatedInfo = ticket ? `Updated by ${ticket.updatedBy || ''} on ${ticket.lastModified ? new Date(ticket.lastModified).toLocaleDateString() : ''}` : '';

  if (!open) return null;

  return (
    <Drawer anchor="right"
      open={open}
      onClose={handleClose}
      variant="persistent"
      PaperProps={{ sx: { top: '70px', height: 'calc(100vh - 70px)' } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1, pt: 1 }}>
        <IconButton onClick={handleClose}>
          <ChevronRightIcon />
        </IconButton>
        {ticketId && (
          <IconButton onClick={() => navigate(`/tickets/${ticketId}`)}>
            <VisibilityIcon />
          </IconButton>
        )}
      </Box>
      {ticket && (
        <Box sx={{ width: 400, position: 'relative', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {ticketId && <TicketView ticketId={ticketId} showHistory />}
          {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserAvatar name={ticket.assignedTo || 'NA'} size={32} />
              <Typography variant="subtitle1">{ticket.id}</Typography>
            </Box>
            <Box>
              {editing ? (
                <>
                  <CustomIconButton icon="close" onClick={cancelEditing} />
                  <CustomIconButton icon="check" onClick={handleSave} />
                </>
              ) : (
                <CustomIconButton icon="edit" onClick={() => setEditing(true)} />
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
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0 }}>
            {updatedInfo}
          </Typography>
          <Box sx={{ mt: 2 }}>
            {renderText(description, setDescription, true)}
          </Box>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
              <Typography variant="body2" color="text.secondary">Priority</Typography>
              {renderSelect(priority, setPriority, priorityOptions)}
              <InfoIcon content={(
                <div>
                  {priorityDetails.map(p => (
                    <div key={p.id}>{p.level} - {p.description}</div>
                  ))}
                </div>
              )} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Severity</Typography>
              {renderSelect(severity, setSeverity, severityOptions)}
              <InfoIcon content={(
                <div>
                  {severityDetails.map(s => (
                    <div key={s.id}>{s.level} - {s.description}</div>
                  ))}
                </div>
              )} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Recommended Severity</Typography>
              {renderSelect(recommendedSeverity, setRecommendedSeverity, severityOptions)}
            </Box>
          </Box>
          {ticketId && (
            <CustomFieldset title={t('History')} style={{ marginTop: 16, margin: 0, padding: 0 }}>
              <Histories ticketId={ticketId} />
            </CustomFieldset>
          )}
          <CustomFieldset title={t('Comment')} className="mt-4" style={{ margin: 0, padding: 0 }}>
            <CommentsSection ticketId={ticketId as string} />
          </CustomFieldset> */}
        </Box>
      )}
    </Drawer>
  );
};

export default ViewTicket;

