import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { updateTicket } from '../../services/TicketService';
import { useApi } from '../../hooks/useApi';
import { getCurrentUserDetails } from '../../config/config';

interface ActionRemarkProps {
  ticket: any;
  actionName: string;
  payload: Record<string, any>;
  onCancel: () => void;
  onSuccess?: () => void;
}

const getConfirmationText = (action: string) => {
  switch (action) {
    case 'Reopen':
      return 'If you are sure you want to Reopen the ticket, please add a remark and submit';
    case 'Resolve':
      return 'If you are sure you want to Resolve the ticket, please add a remark and submit';
    case 'Close':
      return 'If you are sure you want to Close the ticket, please add a remark and submit';
    default:
      return `If you are sure you want to ${action} the ticket, please add a remark and submit`;
  }
};

const ActionRemarkComponent: React.FC<ActionRemarkProps> = ({ ticket, actionName, payload, onCancel, onSuccess }) => {
  const [remark, setRemark] = useState('');
  const { apiHandler: updateTicketApiHandler } = useApi<any>();

  const submit = () => {
    const id = ticket.id;
    const reqPayload = {
      ...payload,
      remark,
      assignedBy: getCurrentUserDetails()?.username,
    } as any;
    updateTicketApiHandler(() => updateTicket(id, reqPayload)).then(() => {
      onSuccess && onSuccess();
    });
    onCancel();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="body2">{getConfirmationText(actionName)}</Typography>
      <TextField size="small" value={remark} onChange={(e) => setRemark(e.target.value)} />
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button variant="contained" size="small" onClick={submit}>
          Submit
        </Button>
        <Button variant="outlined" size="small" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default ActionRemarkComponent;
