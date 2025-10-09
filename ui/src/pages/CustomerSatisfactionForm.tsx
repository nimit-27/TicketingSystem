import { Card, Button, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StarRating from '../components/Feedback/StarRating';
import { SubmitFeedbackRequest, submitFeedback, getFeedbackForm, getFeedback, TicketFeedbackResponse, FeedbackFormResponse } from '../services/FeedbackService';
import { useSnackbar } from '../context/SnackbarContext';
import { useApi } from '../hooks/useApi';

const CustomerSatisfactionForm: React.FC = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showMessage } = useSnackbar();

  const feedbackStatus = (location.state as string | undefined) ?? 'PENDING';

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

  const { data: getFeedbackData, apiHandler: getFeedbackApiHandler, success: getFeedbackSuccess } = useApi<any>();
  const { data: getFeedbackFormData, apiHandler: getFeedbackFormApiHandler, success: getFeedbackFormSuccess } = useApi<any>();
  // const { data: getFeedbackData, apiHandler: getFeedbackApiHandler, success: getFeedbackSuccess } = useApi<TicketFeedbackResponse>();
  // const { data: getFeedbackFormData, apiHandler: getFeedbackFormApiHandler, success: getFeedbackFormSuccess } = useApi<FeedbackFormResponse>();

  const getFeedbackApi = (id: string) => getFeedbackApiHandler(() => getFeedback(id));
  const getFeedbackFormApi = (id: string) => getFeedbackFormApiHandler(() => getFeedbackForm(id));

  useEffect(() => {
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
  }, [ticketId, feedbackStatus]);

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
    if (!ticketId || ticketId === " ") return;
    setLoading(true);
    submitFeedback(ticketId, formData)
      .then(() => {
        showMessage('Feedback submitted', 'success');
        navigate(-1);
      })
      .finally(() => setLoading(false));
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (ticketId) {
      navigate(`/tickets/${ticketId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <Card sx={{ p: 3, maxWidth: 600, margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom>
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
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {!viewMode && (
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Submit
          </Button>
        )}
        {!viewMode && (
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
        )}
        {viewMode && (
          <Button variant="outlined" onClick={handleCancel}>
            Close
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CustomerSatisfactionForm;
