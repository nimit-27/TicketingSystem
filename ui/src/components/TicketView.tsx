import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import UserAvatar from './UI/UserAvatar/UserAvatar';
import { useApi } from '../hooks/useApi';
import { getTicket, updateTicket } from '../services/TicketService';
import { getCurrentUserDetails } from '../config/config';
import { getPriorities } from '../services/PriorityService';
import { getSeverities } from '../services/SeverityService';
import InfoIcon from './UI/Icons/InfoIcon';
import { PriorityInfo, SeverityInfo } from '../types';
import CustomIconButton from './UI/IconButton/CustomIconButton';
import CommentsSection from './Comments/CommentsSection';
import Histories from '../pages/Histories';
import CustomFieldset from './CustomFieldset';
import { useTranslation } from 'react-i18next';
import { checkFieldAccess } from '../utils/permissions';

interface TicketViewProps {
  ticketId: string;
  showHistory?: boolean;
  sidebar?: boolean;
}

const TicketView: React.FC<TicketViewProps> = ({ ticketId, showHistory = false, sidebar = false }) => {
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
  const { t } = useTranslation();

  const allowEdit = checkFieldAccess('ticketDetails', 'editMode');

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

  const cancelEditing = () => {
    setEditing(false);
    if (ticket) {
      setSubject(ticket.subject || '');
      setDescription(ticket.description || '');
      setPriority(ticket.priority || '');
      setSeverity(ticket.severity || '');
      setRecommendedSeverity(ticket.recommendedSeverity || '');
    }
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
      >
        {(Array.isArray(options) && options.length > 0) ? options.map(o => (
          <MenuItem key={o} value={o}>{o}</MenuItem>
        )) : <MenuItem key="" value="">None</MenuItem>}
      </Select>
    ) : (
      <Typography color="text.secondary" sx={{ mt: 1 }}>{value || '-'}</Typography>
    )
  );

  const createdInfo = ticket ? `Created by ${ticket.requestorName || ticket.userId || ''} on ${ticket.reportedDate ? new Date(ticket.reportedDate).toLocaleDateString() : ''}` : '';
  const updatedInfo = ticket ? `Updated by ${ticket.updatedBy || ''} on ${ticket.lastModified ? new Date(ticket.lastModified).toLocaleDateString() : ''}` : '';

  if (!ticket) return null;

  return (
    <Box sx={{ width: '100%', position: 'relative', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UserAvatar name={ticket.assignedTo || 'NA'} size={32} />
          <Typography variant="subtitle1">{ticket.id}</Typography>
        </Box>
        {allowEdit && <Box>
          {editing ? (
            <>
              <CustomIconButton icon="close" onClick={cancelEditing} />
              <CustomIconButton icon="check" onClick={handleSave} />
            </>
          ) : (
            <CustomIconButton icon="edit" onClick={() => setEditing(true)} />
          )}
        </Box>}
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
        {priority && <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
          <Typography variant="body2" color="text.secondary">Priority</Typography>
          {renderSelect(priority, setPriority, priorityOptions)}
          <InfoIcon content={(
            <div>
              {priorityDetails.map(p => (
                <div key={p.id}>{p.level} - {p.description}</div>
              ))}
            </div>
          )} />
        </Box>}
        {severity && <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Severity</Typography>
          {renderSelect(severity, setSeverity, severityOptions)}
          <InfoIcon content={(
            <div>
              {severityDetails.map(s => (
                <div key={s.id}>{s.level} - {s.description}</div>
              ))}
            </div>
          )} />
        </Box>}
        {recommendedSeverity && <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Recommended Severity</Typography>
          {renderSelect(recommendedSeverity, setRecommendedSeverity, severityOptions)}
        </Box>}
      </Box>
      {showHistory && (
        <CustomFieldset title={t('History')} style={{ marginTop: 16, margin: 0, padding: 0 }}>
          <Histories ticketId={ticketId} />
        </CustomFieldset>
      )}
      <CustomFieldset title={t('Comment')} className="mt-4" style={{ margin: 0, padding: 0 }}>
        <CommentsSection ticketId={ticketId} />
      </CustomFieldset>
    </Box>
  );
};

export default TicketView;

