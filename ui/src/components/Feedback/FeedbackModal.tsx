import React, { useEffect, useState } from 'react';
import { Modal, Box, Button, TextField, Typography } from '@mui/material';
import StarRating from './StarRating';
import { SubmitFeedbackRequest, submitFeedback, getFeedbackForm, getFeedback, FeedbackFormResponse, TicketFeedbackResponse } from '../../services/FeedbackService';
import { useSnackbar } from '../../context/SnackbarContext';
import { useApi } from '../../hooks/useApi';
interface FeedbackModalProps {
  open: boolean;
  ticketId?: string;
  onClose: () => void;
  feedbackStatus?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, ticketId, onClose, feedbackStatus }) => {
  const { showMessage } = useSnackbar();
  const createInitialFormData = (): SubmitFeedbackRequest => ({
    overallSatisfaction: 0,
    resolutionEffectiveness: 0,
    communicationSupport: 0,
    timeliness: 0,
    comments: ''
  });
  const [formData, setFormData] = useState<SubmitFeedbackRequest>(createInitialFormData());
  const [resolvedAt, setResolvedAt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);

  const { data: getFeedbackData, apiHandler: getFeedbackApiHandler, success: getFeedbackSuccess } = useApi<TicketFeedbackResponse>();
  const { data: getFeedbackFormData, apiHandler: getFeedbackFormApiHandler, success: getFeedbackFormSuccess } = useApi<FeedbackFormResponse>();

  const getFeedbackApi = (id: string) => getFeedbackApiHandler(() => getFeedback(id));
  const getFeedbackFormApi = (id: string) => getFeedbackFormApiHandler(() => getFeedbackForm(id));

  useEffect(() => {
    if (!open) {
      setFormData(createInitialFormData());
      setResolvedAt('');
      setViewMode(false);
      return;
    }

    if (!ticketId) {
      return;
    }

    if (feedbackStatus === 'PROVIDED') {
      setViewMode(true);
      getFeedbackApi(ticketId);
    } else {
      setViewMode(false);
      setFormData(createInitialFormData());
      getFeedbackFormApi(ticketId);
    }
  }, [open, ticketId, feedbackStatus]);

  useEffect(() => {
    if (getFeedbackSuccess && getFeedbackData) {
      setFormData({
        overallSatisfaction: getFeedbackData.overallSatisfaction ?? 0,
        resolutionEffectiveness: getFeedbackData.resolutionEffectiveness ?? 0,
        communicationSupport: getFeedbackData.communicationSupport ?? 0,
        timeliness: getFeedbackData.timeliness ?? 0,
        comments: getFeedbackData.comments ?? '',
      });
      setResolvedAt(getFeedbackData.dateOfResolution ?? '');
    }
  }, [getFeedbackSuccess, getFeedbackData]);

  useEffect(() => {
    if (getFeedbackFormSuccess && getFeedbackFormData) {
      setResolvedAt(getFeedbackFormData.dateOfResolution ?? '');
    }
  }, [getFeedbackFormSuccess, getFeedbackFormData]);

  const handleRatingChange = (field: keyof Omit<SubmitFeedbackRequest, 'comments'>) => (value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCommentsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormData(prev => ({ ...prev, comments: value }));
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
        <StarRating label="Overall Satisfaction" value={formData.overallSatisfaction} onChange={handleRatingChange('overallSatisfaction')} readOnly={viewMode} />
        <StarRating label="Resolution Effectiveness" value={formData.resolutionEffectiveness} onChange={handleRatingChange('resolutionEffectiveness')} readOnly={viewMode} />
        <StarRating label="Communication and Support" value={formData.communicationSupport} onChange={handleRatingChange('communicationSupport')} readOnly={viewMode} />
        <StarRating label="Timeliness" value={formData.timeliness} onChange={handleRatingChange('timeliness')} readOnly={viewMode} />
        <TextField
          label="Additional Comments/Feedback"
          multiline
          rows={4}
          value={formData.comments}
          onChange={handleCommentsChange}
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
          {!viewMode && (
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
          )}
          {viewMode && (
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default FeedbackModal;

