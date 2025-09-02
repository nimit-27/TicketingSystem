import React, { useEffect, useState } from 'react';
import { Modal, Box, Button, TextField, Typography } from '@mui/material';
import StarRating from './StarRating';
import { SubmitFeedbackRequest, submitFeedback, getFeedbackForm, getFeedback } from '../../services/FeedbackService';
import { useSnackbar } from '../../context/SnackbarContext';

interface FeedbackModalProps {
  open: boolean;
  ticketId?: string;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, ticketId, onClose }) => {
  const { showMessage } = useSnackbar();
  const [formData, setFormData] = useState<SubmitFeedbackRequest>({
    overallSatisfaction: 0,
    resolutionEffectiveness: 0,
    communicationSupport: 0,
    timeliness: 0,
    comments: ''
  });
  const [resolvedAt, setResolvedAt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    if (!open || !ticketId) return;
    getFeedback(ticketId).then(res => {
      if (res.data) {
        const f = res.data;
        setFormData({
          overallSatisfaction: f.overallSatisfaction,
          resolutionEffectiveness: f.resolutionEffectiveness,
          communicationSupport: f.communicationSupport,
          timeliness: f.timeliness,
          comments: f.comments
        });
        setResolvedAt(f.submittedAt);
        setViewMode(true);
      } else {
        getFeedbackForm(ticketId).then(r => {
          setResolvedAt(r.data.dateOfResolution);
        });
      }
    }).catch(() => {
      getFeedbackForm(ticketId).then(r => setResolvedAt(r.data.dateOfResolution));
    });
  }, [open, ticketId]);

  const handleChange = (field: keyof SubmitFeedbackRequest) => (value: number | React.ChangeEvent<HTMLInputElement>) => {
    const val = typeof value === 'number' ? value : parseInt(value.target.value, 10);
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = () => {
    if (!ticketId) return;
    setLoading(true);
    submitFeedback(ticketId, formData)
      .then(() => {
        showMessage('Feedback submitted', 'success');
        onClose();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', p: 3, maxHeight: '90vh', overflowY: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Customer Satisfaction Form
        </Typography>
        <Typography>Ticket ID: {ticketId}</Typography>
        <Typography>Date of Resolution: {resolvedAt ? new Date(resolvedAt).toLocaleString() : ''}</Typography>
        <StarRating label="Overall Satisfaction" value={formData.overallSatisfaction} onChange={handleChange('overallSatisfaction')} />
        <StarRating label="Resolution Effectiveness" value={formData.resolutionEffectiveness} onChange={handleChange('resolutionEffectiveness')} />
        <StarRating label="Communication and Support" value={formData.communicationSupport} onChange={handleChange('communicationSupport')} />
        <StarRating label="Timeliness" value={formData.timeliness} onChange={handleChange('timeliness')} />
        <TextField
          label="Additional Comments/Feedback"
          multiline
          rows={4}
          value={formData.comments}
          onChange={handleChange('comments') as any}
          fullWidth
          sx={{ mt: 2 }}
          disabled={viewMode}
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          {!viewMode && (
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              Submit
            </Button>
          )}
          <Button variant="outlined" onClick={onClose}>
            {viewMode ? 'Close' : 'Cancel'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default FeedbackModal;

