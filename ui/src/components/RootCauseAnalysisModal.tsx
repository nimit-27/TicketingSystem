import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import FileUpload, { ThumbnailList } from './UI/FileUpload';
import { RootCauseAnalysis } from '../types';
import { BASE_URL } from '../services/api';
import { saveRootCauseAnalysis, deleteRootCauseAnalysisAttachment } from '../services/RootCauseAnalysisService';
import { useApi } from '../hooks/useApi';
import { useSnackbar } from '../context/SnackbarContext';
import GenericButton from './UI/Button';
import CustomFormInput from './UI/Input/CustomFormInput';
import CustomIconButton from './UI/IconButton/CustomIconButton';

interface RootCauseAnalysisModalProps {
  open: boolean;
  // onClose: () => void;
  setIsRcaModalOpen: (bool: boolean) => void;
  rcaStatus: string;
  ticketId: string;
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
  // onClose,
  setIsRcaModalOpen,
  rcaStatus,
  ticketId,
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
    control,
    formState: { errors },
  } = useForm();

  const descriptionOfCauseValue = useWatch({ control, name: 'descriptionofCause' });
  const resolutionDescription = useWatch({ control, name: 'resolutionDescription' });

  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [isEditMode, setEditMode] = useState<Boolean>(false)

  const isRcaSubmitted = rcaStatus === 'SUBMITTED'

  const existingAttachmentUrls = useMemo(
    () => existingAttachments.map((path) => `${BASE_URL}/uploads/${path}`),
    [existingAttachments],
  );

  const showAttachments = true;
  const showThumbnailList = existingAttachmentUrls.length > 0;
  const showFileUpload = !isRcaSubmitted;
  const showCancelButton = isEditMode;
  const showCloseButton = true;
  const showSubmitButton = !isRcaSubmitted || isEditMode;
  const showEditIcon = !isEditMode;

  const isViewMode = isRcaSubmitted && isEditMode;

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

  const onCancel = () => {
    setEditMode(false)
  }

  const onClose = () => {
    // setEditMode(false)
    setIsRcaModalOpen(false)
  }

  const modalTitle = `${isRcaSubmitted ? 'View' : 'Submit'} Root Cause Analysis`

  return (
    <Modal open={open} onClose={onClose} >
      <Box
        component="form"
        onSubmit={handleSubmit(() => onSubmit)}
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
        <div className='d-flex'>
          <Typography variant="h6">{t(modalTitle)}</Typography>
          {showEditIcon && <CustomIconButton icon='edit' onClick={() => setEditMode(true)} />}
        </div>
        <div className='d-flex justify-content-between'>
          {/* <Typography variant="body2">
            {t('Ticket ID')}: {ticketId}
          </Typography> */}
          <Typography variant="body2">
            {t('Severity')}: {initialData?.severityLabel || '-'}
          </Typography>
        </div>

        {isViewMode
          ? <Typography sx={{ mt: 1, lineHeight: 1.66 }}>{descriptionOfCauseValue || ' - '}</Typography>
          : <div className="col-md-6 mb-3 px-4">
            <CustomFormInput
              name="Description of cause"
              label={t('Description of cause')}
              multiline
              minRows={3}
              slotProps={{
                inputLabel: { shrink: descriptionOfCauseValue }
              }}
              register={register}
              errors={errors}
              disabled
            />
          </div>}
        {isViewMode
          ? <Typography sx={{ mt: 1, lineHeight: 1.66 }}>{resolutionDescription || ' - '}</Typography>
          : <div className="col-md-6 mb-3 px-4">
            <CustomFormInput
              name="Resolution Description"
              label={t('Resolution Description')}
              multiline
              minRows={3}
              slotProps={{
                inputLabel: { shrink: resolutionDescription }
              }}
              register={register}
              errors={errors}
              disabled
            />
          </div>}

        {showAttachments && <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {t(`${existingAttachmentUrls.length > 0 ? '' : 'No'} Attachments`)}
          </Typography>
          {showThumbnailList && (
            <Box sx={{ mt: 1 }}>
              <ThumbnailList
                attachments={existingAttachmentUrls}
                thumbnailSize={100}
                onRemove={handleExistingAttachmentRemove}
              />
            </Box>
          )}
          {showFileUpload && <Box sx={{ mt: 1 }}>
            <FileUpload
              maxSizeMB={5}
              thumbnailSize={100}
              attachments={newAttachments}
              onFilesChange={handleFilesChange}
            />
          </Box>}
        </Box>}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {showCloseButton && <GenericButton variant="outlined" onClick={onClose} disabled={savePending}>
            {t('Close')}
          </GenericButton>}
          {showCancelButton && <GenericButton variant="outlined" onClick={onCancel} disabled={savePending}>
            {t('Cancel')}
          </GenericButton>}
          {showSubmitButton && <GenericButton type="submit" variant="contained" disabled={savePending}>
            {t('Submit')}
          </GenericButton>}
        </Box>
      </Box>
    </Modal>
  );
};

export default RootCauseAnalysisModal;
