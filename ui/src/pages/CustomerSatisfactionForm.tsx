import { Card, Button, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import StarRating from '../components/Feedback/StarRating';
import { SubmitFeedbackRequest, submitFeedback, getFeedbackForm, getFeedback } from '../services/FeedbackService';
import { useSnackbar } from '../context/SnackbarContext';

const CustomerSatisfactionForm: React.FC = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showMessage } = useSnackbar();
  debugger
  const feedbackStatus = location.state?.feedbackStatus as string || '';

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
    if (feedbackStatus !== "PROVIDED") return;
    if (!ticketId) return;
    
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
      getFeedbackForm(ticketId!).then(r => setResolvedAt(r.data.dateOfResolution));
    });
  }, [ticketId]);

  const handleChange = (field: keyof SubmitFeedbackRequest) => (value: number | React.ChangeEvent<HTMLInputElement>) => {
    const val = typeof value === 'number' ? value : parseInt(value.target.value, 10);
    setFormData(prev => ({ ...prev, [field]: val }));
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

  return (
    <Card sx={{ p: 3, maxWidth: 600, margin: '20px auto' }}>
      <Typography variant="h5" gutterBottom>
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
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {!viewMode && (
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            Submit
          </Button>
        )}
        <Button variant="outlined" onClick={() => navigate(`/tickets/${ticketId}`)}>
          Cancel
        </Button>
      </div>
    </Card>
  );
};

export default CustomerSatisfactionForm;
