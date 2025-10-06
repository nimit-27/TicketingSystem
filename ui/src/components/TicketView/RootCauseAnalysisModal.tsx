import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import FileUpload, { ThumbnailList } from '../UI/FileUpload';
import { RootCauseAnalysis } from '../../types';
import { BASE_URL } from '../../services/api';
import { saveRootCauseAnalysis, deleteRootCauseAnalysisAttachment, getRootCauseAnalysis } from '../../services/RootCauseAnalysisService';
import { useApi } from '../../hooks/useApi';
import { useSnackbar } from '../../context/SnackbarContext';
import GenericButton from '../UI/Button';
import CustomFormInput from '../UI/Input/CustomFormInput';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { getTicket } from '../../services/TicketService';

interface RootCauseAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  rcaStatus: string;
  ticketId: string;
  updatedBy: string;
}

interface RootCauseAnalysisFormValues {
  descriptionOfCause: string;
  resolutionDescription: string;
  attachments: File[];
}


const RootCauseAnalysisModal: React.FC<RootCauseAnalysisModalProps> = ({
  open,
  onClose,
  rcaStatus,
  ticketId,
  updatedBy,
}) => {
  const { t } = useTranslation();

  const [rcaData, setRcaData] = useState<RootCauseAnalysis | null>(null);

  const { showMessage } = useSnackbar();
  const { data: ticket, apiHandler: getTicketHandler } = useApi<any>();
  const { apiHandler: fetchHandler } = useApi<RootCauseAnalysis | null>();
  const { apiHandler: saveHandler, pending: savePending } = useApi<RootCauseAnalysis | null>();
  const { apiHandler: deleteHandler } = useApi<RootCauseAnalysis | null>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      descriptionOfCause: rcaData?.descriptionOfCause ?? '',
      resolutionDescription: rcaData?.resolutionDescription ?? '',
      attachments: [],
    },
  });

  const descriptionOfCauseValue = useWatch({ control, name: 'descriptionOfCause' });
  const resolutionDescriptionValue = useWatch({ control, name: 'resolutionDescription' });

  const [currentData, setCurrentData] = useState<RootCauseAnalysis | null>(rcaData ?? null);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<string[]>([]);
  const [isEditMode, setEditMode] = useState<boolean>(rcaStatus !== 'SUBMITTED');
  const [isRcaModalOpen, setIsRcaModalOpen] = useState(false);

  const isRcaSubmitted = rcaStatus === 'SUBMITTED';
  const isViewMode = isRcaSubmitted && !isEditMode;

  const existingAttachmentUrls = useMemo(
    () => existingAttachments.map((path) => `${BASE_URL}/uploads/${path}`),
    [existingAttachments],
  );

  const handleRcaDataChange = useCallback((payload: RootCauseAnalysis | null) => {
    setRcaData(payload ?? null);
  }, []);

  const handleRcaSubmitted = useCallback((payload: RootCauseAnalysis | null) => {
    setRcaData(payload ?? null);
    if (ticketId) {
      getTicketHandler(() => getTicket(ticketId));
    }
  }, [getTicketHandler, ticketId]);

  const handleRcaModalClose = useCallback(() => {
    setIsRcaModalOpen(false);
  }, []);

  const resetForm = useCallback(
    (data: RootCauseAnalysis | null) => {
      const attachmentList = data?.attachments;
      const attachments = Array.isArray(attachmentList) ? attachmentList : [];
      setExistingAttachments(attachments);
      setNewAttachments([]);
      reset({
        descriptionOfCause: data?.descriptionOfCause ?? '',
        resolutionDescription: data?.resolutionDescription ?? '',
        attachments: [],
      });
    },
    [reset],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setCurrentData(rcaData ?? null);
    resetForm(rcaData ?? null);
    setEditMode(rcaStatus !== 'SUBMITTED');
  }, [rcaData, open, resetForm, rcaStatus]);

  useEffect(() => {
    if (!open || !ticketId) {
      return;
    }
    fetchHandler(() => getRootCauseAnalysis(ticketId))
      .then((payload) => {
        const normalized = payload ?? null;
        setCurrentData(normalized);
        resetForm(normalized);
        handleRcaDataChange?.(normalized);
      })
      .catch(() => {
        // Errors handled by useApi
      });
  }, [fetchHandler, handleRcaDataChange, open, resetForm, ticketId]);

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
    if (!ticketId || !path || isViewMode) {
      return;
    }
    try {
      const payload = await deleteHandler(() => deleteRootCauseAnalysisAttachment(ticketId, path, updatedBy));
      const normalized = payload ?? null;
      setCurrentData(normalized);
      resetForm(normalized);
      handleRcaDataChange?.(normalized);
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
      const normalized = payload ?? null;
      setCurrentData(normalized);
      resetForm(normalized);
      handleRcaSubmitted(normalized);
      handleRcaDataChange?.(normalized);
      showMessage(t('Root cause analysis submitted successfully'), 'success');
      if (isRcaSubmitted) {
        setEditMode(false);
      } else {
        onClose();
      }
    } catch {
      // errors handled by useApi
    }
  };

  const onCancel = () => {
    setEditMode(false);
    resetForm(currentData);
  };

  const handleClose = () => {
    if (savePending) {
      return;
    }
    resetForm(currentData);
    setEditMode(rcaStatus !== 'SUBMITTED');
    onClose();
  };

  const modalTitle = `${isRcaSubmitted ? 'View' : 'Submit'} Root Cause Analysis`;
  const showAttachments = true;
  const showThumbnailList = existingAttachmentUrls.length > 0;
  const showFileUpload = !isViewMode;
  const showCancelButton = isRcaSubmitted && isEditMode;
  const showCloseButton = true;
  const showSubmitButton = !isViewMode;
  const showEditIcon = isRcaSubmitted && !isEditMode;
  const submitLabel = isRcaSubmitted ? t('Save') : t('Submit');

  return (
    <Modal open={open} onClose={handleClose}>
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
        <div className='d-flex align-items-center justify-content-between'>
          <Typography variant="h6">{t(modalTitle)}</Typography>
          {showEditIcon && <CustomIconButton icon='edit' onClick={() => setEditMode(true)} />}
        </div>
        <div className='d-flex justify-content-between'>
          <Typography variant="body2">
            {t('Severity')}: {currentData?.severityLabel || '-'}
          </Typography>
        </div>

        {isViewMode ? (
          <Typography sx={{ mt: 1, lineHeight: 1.66 }}>{currentData?.descriptionOfCause || ' - '}</Typography>
        ) : (
          <div className="col-md-12 mb-3 px-1">
            <CustomFormInput
              name="descriptionOfCause"
              label={t('Description of cause')}
              multiline
              minRows={3}
              slotProps={{
                inputLabel: { shrink: Boolean(descriptionOfCauseValue) }
              }}
              register={register}
              errors={errors}
              required
            />
          </div>
        )}
        {isViewMode ? (
          <Typography sx={{ mt: 1, lineHeight: 1.66 }}>{currentData?.resolutionDescription || ' - '}</Typography>
        ) : (
          <div className="col-md-12 mb-3 px-1">
            <CustomFormInput
              name="resolutionDescription"
              label={t('Resolution Description')}
              multiline
              minRows={3}
              slotProps={{
                inputLabel: { shrink: Boolean(resolutionDescriptionValue) }
              }}
              register={register}
              errors={errors}
              required
            />
          </div>
        )}

        {showAttachments && <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {t(`${existingAttachmentUrls.length > 0 ? '' : 'No'} Attachments`)}
          </Typography>
          {showThumbnailList && (
            <Box sx={{ mt: 1 }}>
              <ThumbnailList
                attachments={existingAttachmentUrls}
                thumbnailSize={100}
                onRemove={showFileUpload ? handleExistingAttachmentRemove : undefined}
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
          {showCloseButton && <GenericButton variant="outlined" onClick={handleClose} disabled={savePending}>
            {t('Close')}
          </GenericButton>}
          {showCancelButton && <GenericButton variant="outlined" onClick={onCancel} disabled={savePending}>
            {t('Cancel')}
          </GenericButton>}
          {showSubmitButton && <GenericButton type="submit" variant="contained" disabled={savePending}>
            {submitLabel}
          </GenericButton>}
        </Box>
      </Box>
    </Modal>
  );
};

export default RootCauseAnalysisModal;
