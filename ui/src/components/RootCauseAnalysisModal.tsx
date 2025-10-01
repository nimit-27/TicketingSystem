import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import FileUpload, { ThumbnailList } from './UI/FileUpload';
import { RootCauseAnalysis } from '../types';
import { BASE_URL } from '../services/api';
import { saveRootCauseAnalysis, deleteRootCauseAnalysisAttachment } from '../services/RootCauseAnalysisService';
import { useApi } from '../hooks/useApi';
import { useSnackbar } from '../context/SnackbarContext';

interface RootCauseAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  severity: string;
  updatedBy: string;
  initialData: RootCauseAnalysis | null;
  onSubmitted: (payload: RootCauseAnalysis | null) => void;
  onDataChange?: (payload: RootCauseAnalysis | null) => void;
}

interface RootCauseAnalysisFormValues {
  descriptionOfCause: string;
  resolutionDescription: string;
  attachments: File[];
}

const RootCauseAnalysisModal: React.FC<RootCauseAnalysisModalProps> = ({
  open,
  onClose,
  ticketId,
  severity,
  updatedBy,
  initialData,
  onSubmitted,
  onDataChange,
}) => {
  const { t } = useTranslation();
  const { showMessage } = useSnackbar();
  const { apiHandler: saveHandler, pending: savePending } = useApi<RootCauseAnalysis | null>();
  const { apiHandler: deleteHandler } = useApi<RootCauseAnalysis | null>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<RootCauseAnalysisFormValues>({
    defaultValues: {
      descriptionOfCause: initialData?.descriptionOfCause ?? '',
      resolutionDescription: initialData?.resolutionDescription ?? '',
      attachments: [],
    },
  });

  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const attachments = Array.isArray(initialData?.attachments) ? initialData.attachments : [];
    setExistingAttachments(attachments);
    setNewAttachments([]);
    reset({
      descriptionOfCause: initialData?.descriptionOfCause ?? '',
      resolutionDescription: initialData?.resolutionDescription ?? '',
      attachments: [],
    });
  }, [initialData, open, reset]);

  const existingAttachmentUrls = useMemo(
    () => existingAttachments.map((path) => `${BASE_URL}/uploads/${path}`),
    [existingAttachments],
  );

  const handleFilesChange = (files: File[]) => {
    setNewAttachments((prev) => {
      const isRemoval = files.length <= prev.length && files.every((file) => prev.includes(file));
      const updated = isRemoval ? files : [...prev, ...files];
      setValue('attachments', updated, { shouldValidate: true });
      return updated;
    });
  };

  const handleExistingAttachmentRemove = async (index: number) => {
    const path = existingAttachments[index];
    if (!ticketId || !path) {
      return;
    }
    try {
      const payload = await deleteHandler(() => deleteRootCauseAnalysisAttachment(ticketId, path, updatedBy));
      const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
      setExistingAttachments(attachments);
      onDataChange?.(payload ?? null);
      showMessage(t('Attachment removed successfully'), 'success');
    } catch {
      // errors handled by useApi
    }
  };

  const onSubmit = async (values: RootCauseAnalysisFormValues) => {
    if (!ticketId) {
      return;
    }
    const formData = new FormData();
    formData.append('descriptionOfCause', values.descriptionOfCause.trim());
    formData.append('resolutionDescription', values.resolutionDescription.trim());
    if (updatedBy) {
      formData.append('updatedBy', updatedBy);
    }
    newAttachments.forEach((file) => formData.append('attachments', file));

    try {
      const payload = await saveHandler(() => saveRootCauseAnalysis(ticketId, formData));
      showMessage(t('Root cause analysis submitted successfully'), 'success');
      onSubmitted(payload ?? null);
    } catch {
      // errors handled by useApi
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          maxWidth: '95vw',
          bgcolor: 'background.paper',
          p: 3,
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="h6">{t('Submit RCA')}</Typography>
        <Divider />
        <Typography variant="body2">
          {t('Ticket ID')}: {ticketId}
        </Typography>
        <Typography variant="body2">
          {t('Severity')}: {severity || '-'}
        </Typography>

        <TextField
          label={t('Description of cause')}
          multiline
          minRows={3}
          fullWidth
          {...register('descriptionOfCause', { required: t('Description of cause is required') })}
          error={Boolean(errors.descriptionOfCause)}
          helperText={errors.descriptionOfCause?.message}
        />

        <TextField
          label={t('Resolution Description')}
          multiline
          minRows={3}
          fullWidth
          {...register('resolutionDescription', { required: t('Resolution description is required') })}
          error={Boolean(errors.resolutionDescription)}
          helperText={errors.resolutionDescription?.message}
        />

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {t('Attachments')}
          </Typography>
          {existingAttachmentUrls.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <ThumbnailList
                attachments={existingAttachmentUrls}
                thumbnailSize={100}
                onRemove={handleExistingAttachmentRemove}
              />
            </Box>
          )}
          <Box sx={{ mt: 1 }}>
            <FileUpload
              maxSizeMB={5}
              thumbnailSize={100}
              attachments={newAttachments}
              onFilesChange={handleFilesChange}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={savePending}>
            {t('Cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={savePending}>
            {t('Submit')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RootCauseAnalysisModal;
