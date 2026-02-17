import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';

export interface RemarkComponentProps {
  /**
   * Name of the action being performed. Used to generate a default
   * confirmation message when a custom message is not provided.
   */
  actionName?: string;
  /**
   * Optional custom message that will be rendered above the remark input.
   * When provided this takes precedence over the generated message from
   * `actionName`.
   */
  message?: string;
  /** Optional title to render at the top when the component is used as a modal. */
  title?: string;
  /** Controls whether the component is rendered inside a modal dialog. */
  isModal?: boolean;
  /** Controls the open state of the dialog when `isModal` is true. */
  open?: boolean;
  /** Callback invoked when the user submits the remark. */
  onSubmit: (remark: string) => void;
  /** Callback invoked when the user cancels or closes the remark input. */
  onCancel: () => void;
  /** Initial remark value shown when the component becomes visible. */
  defaultRemark?: string;
  /** Label for the submit button. Defaults to `Submit`. */
  submitLabel?: string;
  /** Label for the cancel button. Defaults to `Cancel`. */
  cancelLabel?: string;
  /** Label rendered inside the remark text field. */
  textFieldLabel?: string;
  /** Placeholder rendered inside the remark text field. */
  placeholder?: string;
  /** Enables multiline text input when set to true. */
  multiline?: boolean;
  /** Minimum number of rows when multiline input is enabled. */
  minRows?: number;
}

const getConfirmationText = (action?: string) => {
  if (!action) return '';
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

const REMARK_CHAR_LIMIT = 250;

const RemarkComponent: React.FC<RemarkComponentProps> = ({
  actionName,
  message,
  title,
  isModal = false,
  open = false,
  onSubmit,
  onCancel,
  defaultRemark = '',
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  textFieldLabel,
  placeholder,
  multiline = false,
  minRows,
}) => {
  const [remark, setRemark] = useState(defaultRemark);
  const [errorMessage, setErrorMessage] = useState('');
  const remarkLength = remark.length;
  const isRemarkOverLimit = remarkLength > REMARK_CHAR_LIMIT;

  useEffect(() => {
    if (isModal) {
      if (open) {
        setRemark(defaultRemark);
        setErrorMessage('');
      }
    } else {
      setRemark(defaultRemark);
      setErrorMessage('');
    }
  }, [defaultRemark, open, isModal]);

  const confirmationMessage = useMemo(() => message ?? getConfirmationText(actionName), [message, actionName]);

  const handleSubmit = () => {
    const trimmedRemark = remark.trim();
    if (!trimmedRemark) {
      setErrorMessage('Remark cannot be empty.');
      return;
    }
    if (trimmedRemark.length > REMARK_CHAR_LIMIT) {
      setErrorMessage('Remark cannot be more than 250 characters long');
      return;
    }
    setErrorMessage('');
    onSubmit(trimmedRemark);
    if (!isModal) {
      setRemark(defaultRemark);
    }
  };

  const handleCancel = () => {
    setRemark(defaultRemark);
    onCancel();
  };

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {confirmationMessage && (
        <Typography variant="body2">{confirmationMessage}</Typography>
      )}
      <TextField
        size="small"
        value={remark}
        onChange={(e) => {
          const nextValue = e.target.value;
          setRemark(nextValue);
          if (errorMessage && nextValue.trim()) {
            setErrorMessage('');
          }
        }}
        label={textFieldLabel}
        placeholder={placeholder}
        multiline={multiline}
        minRows={multiline ? minRows ?? 3 : undefined}
        autoFocus
        error={Boolean(errorMessage)}
        helperText={errorMessage}
      />
      <small className={`d-block mt-1 ${isRemarkOverLimit ? 'text-danger' : 'text-muted'}`}>
        {remarkLength}/{REMARK_CHAR_LIMIT}
      </small>
    </Box>
  );

  if (isModal) {
    return (
      <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button variant="outlined" size="small" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button variant="contained" size="small" onClick={handleSubmit}>
            {submitLabel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {content}
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button variant="contained" size="small" onClick={handleSubmit}>
          {submitLabel}
        </Button>
        <Button variant="outlined" size="small" onClick={handleCancel}>
          {cancelLabel}
        </Button>
      </Box>
    </Box>
  );
};

export default RemarkComponent;
