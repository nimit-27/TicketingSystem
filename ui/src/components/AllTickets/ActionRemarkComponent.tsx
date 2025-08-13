import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
interface ActionRemarkProps {
  actionName: string;
  onSubmit: (remark: string) => void;
  onCancel: () => void;
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

const ActionRemarkComponent: React.FC<ActionRemarkProps> = ({ actionName, onSubmit, onCancel }) => {
  const [remark, setRemark] = useState('');

  const submit = () => {
    onSubmit(remark);
  };

  const cancelRemark = () => {
    setRemark('');
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
        <Button variant="outlined" size="small" onClick={cancelRemark}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default ActionRemarkComponent;
