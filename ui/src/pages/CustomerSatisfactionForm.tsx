import { Card, Button, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StarRating from '../components/Feedback/StarRating';
import { SubmitFeedbackRequest, submitFeedback, getFeedbackForm, getFeedback } from '../services/FeedbackService';
import { useSnackbar } from '../context/SnackbarContext';

const CustomerSatisfactionForm: React.FC = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!ticketId) return;

    getFeedback(ticketId)
      .then(res => {
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
          setFormData(createInitialFormData());
          setViewMode(false);
          getFeedbackForm(ticketId).then(r => {
            setResolvedAt(r.data.dateOfResolution);
          });
        }
      })
      .catch(() => {
        setFormData(createInitialFormData());
        setViewMode(false);
        getFeedbackForm(ticketId).then(r => setResolvedAt(r.data.dateOfResolution));
      });
  }, [ticketId]);

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
        navigate(`/tickets/${ticketId}`);
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
