import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Typography, TextField, MenuItem, Select, SelectChangeEvent, Button } from '@mui/material';
import UserAvatar from './UI/UserAvatar/UserAvatar';
import { useApi } from '../hooks/useApi';
import { getTicket, updateTicket, addAttachments, deleteAttachment, getTicketSla } from '../services/TicketService';
import { BASE_URL } from '../services/api';
import { getCurrentUserDetails } from '../config/config';
import { getPriorities } from '../services/PriorityService';
import { getSeverities } from '../services/SeverityService';
import InfoIcon from './UI/Icons/InfoIcon';
import GenericButton from './UI/Button';
import { PriorityInfo, SeverityInfo, TicketSla, TicketStatusWorkflow } from '../types';
import CustomIconButton, { IconComponent } from './UI/IconButton/CustomIconButton';
import CommentsSection from './Comments/CommentsSection';
import SlaDetails from './SlaDetails';
import Histories from '../pages/Histories';
import CustomFieldset from './CustomFieldset';
import { useTranslation } from 'react-i18next';
import { checkFieldAccess } from '../utils/permissions';
import FileUpload, { ThumbnailList } from './UI/FileUpload';
import FeedbackModal from './Feedback/FeedbackModal';
import { getFeedback } from '../services/FeedbackService';
import { getStatusWorkflowMappings } from '../services/StatusService';
import GenericDropdown, { DropdownOption } from './UI/Dropdown/GenericDropdown';
import GenericDropdownController from './UI/Dropdown/GenericDropdownController';
import RemarkComponent from './UI/Remark/RemarkComponent';
import { getDropdownOptions, getStatusNameById } from '../utils/Utils';
import SlaProgressBar from './SlaProgressBar';

interface TicketViewProps {
  ticketId: string;
  showHistory?: boolean;
  sidebar?: boolean;
  focusRecommendSeverity?: boolean;
  onRecommendSeverityFocusHandled?: () => void;
}

const normaliseSla = (slaData: TicketSla | null): TicketSla | null => {
  if (!slaData) {
    return null;
  }

  const rawBreached = slaData.breachedByMinutes ?? 0;
  const breachedByMinutes = rawBreached < 0 ? 0 : rawBreached;
  const timeTillDueDate = rawBreached < 0 ? Math.abs(rawBreached) : slaData.timeTillDueDate ?? 0;

  return {
    ...slaData,
    breachedByMinutes,
    timeTillDueDate,
  };
};

const TicketView: React.FC<TicketViewProps> = ({ ticketId, showHistory = false, sidebar = false, focusRecommendSeverity, onRecommendSeverityFocusHandled }) => {
  const { t } = useTranslation();

  // USEAPI INITIALIZATIONS
  const { data: ticket, apiHandler: getTicketHandler } = useApi<any>();
  const { apiHandler: updateTicketHandler } = useApi<any>();
  // const { data: workflowData, apiHandler: workflowApiHandler } = useApi<Record<string, TicketStatusWorkflow[]>>();
  const { data: workflowData, apiHandler: workflowApiHandler } = useApi<any>();

  // USESTATE INITIALIZATIONS
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [priorityId, setPriorityId] = useState('');
  const [severity, setSeverity] = useState('');
  const [recommendedSeverity, setRecommendedSeverity] = useState('');
  const [priorityOptions, setPriorityOptions] = useState<string[]>([]);
  const [priorityDetails, setPriorityDetails] = useState<PriorityInfo[]>([]);
  const [severityList, setSeverityList] = useState<SeverityInfo[]>([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const [sla, setSla] = useState<TicketSla | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  // const [statusWorkflows, setStatusWorkflows] = useState<Record<string, TicketStatusWorkflow[]>>({});
  const [statusWorkflows, setStatusWorkflows] = useState<any>({});
  const [severityToRecommendSeverity, setSeverityToRecommendSeverity] = useState<boolean>(false);
  const [showRecommendRemark, setShowRecommendRemark] = useState(false);
  const [showStatusRemark, setShowStatusRemark] = useState(false);
  const [selectedStatusAction, setSelectedStatusAction] = useState<TicketStatusWorkflow | null>(null);
  const recommendSeverityButtonRef = useRef<HTMLButtonElement | null>(null);

  const emptyFileList = useMemo<File[]>(() => [], []);


  // PERMISSION BOOLEANS
  const allowEdit = checkFieldAccess('ticketDetails', 'editMode');
  const showRecommendedSeverity = checkFieldAccess('ticketDetails', 'recommendedSeverity') && ticket?.recommendedSeverity;
  const showRecommendSeverity = checkFieldAccess('ticketDetails', 'recommendSeverity');
  const showSeverity = checkFieldAccess('ticketDetails', 'severity');
  const showSeverityToRecommendSeverity = showSeverity && severityToRecommendSeverity

  // DROPDOWN OPTIONS - getDropdownOptions(arr, label, value)
  // const severityOptions: DropdownOption[] = severityList.map((s: SeverityInfo) => ({ label: s.level, value: s.level }));
  const severityOptions: DropdownOption[] = getDropdownOptions(severityList, 'level', 'id');

  const currentUserDetails = getCurrentUserDetails();
  const currentUsername = currentUserDetails?.username || '';
  const currentUserId = currentUserDetails?.userId || '';
  const roles = currentUserDetails?.role || [];
  const isItManager = roles.includes("9");
  const isRno = roles.includes("4");

  useEffect(() => {
    if (ticketId) {
      getTicketHandler(() => getTicket(ticketId));
      getPriorities().then(res => {
        const priorityData = Array.isArray(res?.data?.body?.data) ? res.data?.body?.data : [];
        setPriorityOptions(priorityData.map((p: PriorityInfo) => p.level));
        setPriorityDetails(priorityData);
      });
      getSeverities().then(res => {
        const severityData = Array.isArray(res?.data) ? res.data : [];
        setSeverityList(severityData);
      });
      const roles = getCurrentUserDetails()?.role || [];
      workflowApiHandler(() => getStatusWorkflowMappings(roles));
      getTicketSla(ticketId)
        .then(res => {
          const body = res.data?.body ?? res.data;
          const slaData = res.status === 200 ? body?.data ?? null : null;
          const normalised = normaliseSla(slaData && typeof slaData === 'object' ? slaData as TicketSla : null);
          setSla(normalised);
        })
        .catch(() => setSla(null));
    }
  }, [ticketId, getTicketHandler, workflowApiHandler]);

  useEffect(() => {
    if (ticket) {
      setSubject(ticket.subject || '');
      setDescription(ticket.description || '');
      setPriority(ticket.priority || '');
      setPriorityId(ticket.priorityId || '');
      setSeverity(ticket.severity || '');
      setRecommendedSeverity(ticket.recommendedSeverity || '');
      if (Array.isArray(ticket.attachmentPaths)) {
        setAttachments(ticket.attachmentPaths.map((att: string) => `${BASE_URL}/uploads/${att}`));
      } else if (ticket.attachmentPath) {
        setAttachments([`${BASE_URL}/uploads/${ticket.attachmentPath}`]);
      } else {
        setAttachments([]);
      }
      if (ticket.statusLabel?.toLowerCase() === 'closed') {
        getFeedback(ticketId)
          .then(res => setHasFeedback(Boolean(res.data)))
          .catch(() => setHasFeedback(false));
      }
    }
  }, [ticket]);

  useEffect(() => {
    if (workflowData) {
      setStatusWorkflows(workflowData);
    }
  }, [workflowData]);

  useEffect(() => {
    if (focusRecommendSeverity && showSeverity && !showSeverityToRecommendSeverity && recommendSeverityButtonRef.current) {
      recommendSeverityButtonRef.current.focus();
      onRecommendSeverityFocusHandled?.();
    }
  }, [focusRecommendSeverity, showSeverity, showSeverityToRecommendSeverity, onRecommendSeverityFocusHandled]);

  const updateTicketDetails = async (remark?: string) => {
    if (!ticketId) return;
    const payload: any = {
      subject,
      description,
      priority: priorityId,
      severity,
      recommendedSeverity,
      updatedBy: currentUsername
    };
    if (remark !== undefined) {
      payload.remark = remark;
    }
    if (isRno && recommendedSeverity && ticket?.statusId !== '6') {
      payload.status = { statusId: '6' };
      payload.severityRecommendedBy = currentUsername;
    }
    try {
      await updateTicketHandler(() => updateTicket(ticketId, payload));
      setEditing(false);
      setShowRecommendRemark(false);
      setSeverityToRecommendSeverity(false);
      await getTicketHandler(() => getTicket(ticketId));
    } catch {
      // no-op: errors handled within useApi
    }
  };

  const handleSave = () => {
    updateTicketDetails();
  };

  const handleSubmitRecommendSeverity = (remark: string) => {
    updateTicketDetails(remark);
  };

  const handleApplyRecommendedSeverity = () => {
    if (ticket?.recommendedSeverity) {
      setSeverity(ticket.recommendedSeverity);
    }
  };

  const handleEscalate = () => {
    if (!ticketId) return;
    const payload = {
      severity,
      updatedBy: currentUsername,
      status: { statusId: '11' }
    };
    updateTicketHandler(() => updateTicket(ticketId, payload)).then(() => {
      getTicketHandler(() => getTicket(ticketId));
    });
  };

  const cancelEditing = () => {
    setEditing(false);
    setShowRecommendRemark(false);
    setSeverityToRecommendSeverity(false);
    if (ticket) {
      setSubject(ticket.subject || '');
      setDescription(ticket.description || '');
      setPriority(ticket.priority || '');
      setPriorityId(ticket.priorityId || '');
      setSeverity(ticket.severity || '');
      setRecommendedSeverity(ticket.recommendedSeverity || '');
    }
  };

  const handleAttachmentUpload = (files: File[]) => {
    if (!files.length || !ticketId) return;
    addAttachments(ticketId, files).then(() => {
      getTicketHandler(() => getTicket(ticketId));
      setUploadKey(k => k + 1);
    });
  };

  const handleAttachmentRemove = (index: number) => {
    const att = attachments[index];
    const path = att.replace(`${BASE_URL}/uploads/`, '');
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteAttachment(ticketId, path).then(() => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
      });
    }
  };

  const renderText = (value: string, onChange: (v: string) => void, multiline?: boolean) => (
    editing ? (
      <TextField
        value={value}
        onChange={e => onChange(e.target.value)}
        variant="outlined"
        fullWidth
        multiline={multiline}
        minRows={multiline ? 3 : undefined}
        size="small"
        sx={{ mt: 1 }}
      />
    ) : (
      <Typography sx={{ mt: 1, lineHeight: 1.66 }}>{value || ' - '}</Typography>
    )
  );

  const renderSelect = (value: string, setValue: (v: string) => void, options: string[]) => (
    editing ? (
      <Select
        value={value}
        onChange={(e: SelectChangeEvent) => setValue(e.target.value as string)}
        fullWidth
        size="small"
      >
        {(Array.isArray(options) && options.length > 0) ? options.map(o => (
          <MenuItem key={o} value={o}>{t(o)}</MenuItem>
        )) : <MenuItem key="" value="">{t('None')}</MenuItem>}
      </Select>
    ) : (
      <Typography sx={{ mt: 1 }}>{value ? t(value) : ' - '}</Typography>
    )
  );
  // const disallowed = ['Assign', 'Further Assign', 'Assign / Assign Further', 'Assign Further'];

  // const getAvailableActions = useCallback((statusId?: string) => {
  //   return (statusWorkflows[statusId || ''] || []).filter((a: any) => !disallowed.includes(a.action));
  // }, [statusWorkflows]);

  // const canRecommendSeverity = useMemo(() => {
  //   if (!ticket?.statusId) return false;
  //   return getAvailableActions(ticket.statusId).some((a: { id: number; }) => a.id === 11);
  // }, [ticket?.statusId, getAvailableActions]);

  const canEscalate = isItManager && ticket?.statusId === '6';

  const hasApproveSeverityAction = useMemo(() => {
    if (!ticket?.statusId) return false;
    const workflows: TicketStatusWorkflow[] = statusWorkflows[ticket.statusId] || [];
    return workflows.some(wf => wf.id === 12);
  }, [statusWorkflows, ticket?.statusId]);

  const handleApproveRecommendedSeverity = () => {
    if (!ticketId || !ticket?.statusId || !ticket.recommendedSeverity) return;
    const workflows: TicketStatusWorkflow[] = statusWorkflows[ticket.statusId] || [];
    const wf = workflows.find(w => w.id === 12);
    if (!wf) return;
    const payload: any = {
      severity: ticket.recommendedSeverity,
      updatedBy: currentUsername,
      status: { statusId: String(wf.nextStatus) }
    };
    updateTicketHandler(() => updateTicket(ticketId, payload)).then(() => {
      getTicketHandler(() => getTicket(ticketId));
    });
  };

  const createdInfo = ticket ? `Created by ${ticket.requestorName || ticket.userId || ' - '} on ${ticket.reportedDate ? new Date(ticket.reportedDate).toLocaleString() : ' - '}` : ' - ';
  const updatedInfo = ticket ? `Updated by ${ticket.updatedBy || ' - '} on ${ticket.lastModified ? new Date(ticket.lastModified).toLocaleDateString() : ' - '}` : ' - ';

  const currentStatusName = useMemo(() => {
    if (!ticket) return '';
    const statusName = ticket.statusId ? getStatusNameById(ticket.statusId) : '';
    return (statusName || ticket.statusLabel || '').trim();
  }, [ticket]);

  const normalisedStatusName = (currentStatusName || '').toLowerCase();
  const isAssignedStatus = normalisedStatusName.includes('assigned');
  const isResolvedStatus = normalisedStatusName === 'resolved';
  const isClosedStatus = normalisedStatusName === 'closed';

  const availableStatusActions = useMemo(() => {
    if (!ticket?.statusId) return [] as TicketStatusWorkflow[];
    return statusWorkflows[ticket.statusId] || [];
  }, [statusWorkflows, ticket?.statusId]);

  const resolveAction = useMemo(
    () => availableStatusActions.find((action: TicketStatusWorkflow) => action.action === 'Resolve') || null,
    [availableStatusActions]
  );
  const closeAction = useMemo(
    () => availableStatusActions.find((action: TicketStatusWorkflow) => action.action === 'Close') || null,
    [availableStatusActions]
  );
  const reopenAction = useMemo(
    () => availableStatusActions.find((action: TicketStatusWorkflow) => action.action === 'Reopen') || null,
    [availableStatusActions]
  );

  const isAssignedToCurrentUser = useMemo(() => {
    if (!ticket?.assignedTo || !currentUsername) return false;
    return ticket.assignedTo.toLowerCase() === currentUsername.toLowerCase();
  }, [ticket?.assignedTo, currentUsername]);

  const isRequester = useMemo(() => {
    if (!ticket?.userId || !currentUserId) return false;
    return ticket.userId.toLowerCase() === currentUserId.toLowerCase();
  }, [ticket?.userId, currentUserId]);

  const shouldShowResolve = Boolean(resolveAction && isAssignedStatus && isAssignedToCurrentUser);
  const shouldShowClose = Boolean(closeAction && isResolvedStatus && isRequester);
  const shouldShowReopen = Boolean(reopenAction && isResolvedStatus && isRequester);
  const canShowFeedbackAction = ticket?.feedbackStatus !== 'NOT_PROVIDED';
  const shouldShowFeedbackButton = isClosedStatus && isRequester && canShowFeedbackAction;

  const handleStatusActionClick = (action: TicketStatusWorkflow | null) => {
    if (!action) return;
    setSelectedStatusAction(action);
    setShowStatusRemark(true);
  };

  const handleStatusRemarkCancel = () => {
    setShowStatusRemark(false);
    setSelectedStatusAction(null);
  };

  const handleStatusRemarkSubmit = async (remark: string) => {
    if (!ticketId || !selectedStatusAction) return;
    const payload: any = {
      status: { statusId: String(selectedStatusAction.nextStatus) },
      remark,
      updatedBy: currentUsername,
      assignedBy: currentUsername,
    };

    try {
      await updateTicketHandler(() => updateTicket(ticketId, payload));
      setShowStatusRemark(false);
      setSelectedStatusAction(null);
      await getTicketHandler(() => getTicket(ticketId));
    } catch {
      // no-op handled by useApi
    }
  };

  const handleFeedbackClose = () => {
    setFeedbackOpen(false);
    if (!ticketId) return;
    getFeedback(ticketId)
      .then(res => setHasFeedback(Boolean(res.data)))
      .catch(() => setHasFeedback(false));
  };

  const youText = t('You');
  const pendingApprovalText = t('Pending Approval');
  const recommendedSeverityBy = ticket?.severityRecommendedBy;
  const recommendedSeverityByText = recommendedSeverityBy
    ? recommendedSeverityBy === currentUsername
      ? youText
      : recommendedSeverityBy
    : ' - ';
  const recommendedSeverityStatus = ticket?.recommendedSeverityStatus;
  const severityApprovedBy = ticket?.severityApprovedBy;
  const severityApprovedByText = severityApprovedBy
    ? severityApprovedBy === currentUsername
      ? youText
      : severityApprovedBy
    : ' - ';
  const recommendedSeverityApprovalText = recommendedSeverityStatus === 'APPROVED' && severityApprovedByText
    ? t('Approved by {{name}}', { name: severityApprovedByText })
    : pendingApprovalText;
  const recommendedSeverityByDisplay = recommendedSeverityByText && recommendedSeverityByText !== ' - '
    ? t('by {{name}}', { name: recommendedSeverityByText })
    : '';

  const priorityInfoContent = useMemo(() => (
    <div>
      {priorityDetails.map(p => (
        <div key={p.id}>{t(p.level)} - {t(p.description)}</div>
      ))}
    </div>
  ), [priorityDetails, t]);

  const severityInfoContent = useMemo(() => (
    <div>
      {severityList.map(s => <div key={s.id}>{t(s.level)} - {t(s.description)}</div>)}
    </div>
  ), [severityList, t]);

  if (!ticket) return null;

  // DESIGN 1
  return (
    <Box sx={{ width: '100%', position: 'relative', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          backgroundColor: '#e8f5e9',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'success.light',
          p: 2,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle2" color="text.primary">
            {t('Status')}: {currentStatusName ? t(currentStatusName) : '-'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {shouldShowResolve && (
              <Button size="small" variant="contained" color="success" onClick={() => handleStatusActionClick(resolveAction)}>
                {t('Resolve Ticket')}
              </Button>
            )}
            {shouldShowClose && (
              <Button size="small" variant="contained" color="success" onClick={() => handleStatusActionClick(closeAction)}>
                {t('Close Ticket')}
              </Button>
            )}
            {shouldShowReopen && (
              <Button size="small" variant="outlined" color="success" onClick={() => handleStatusActionClick(reopenAction)}>
                {t('Reopen Ticket')}
              </Button>
            )}
            {shouldShowFeedbackButton && (
              <Button size="small" variant="contained" color="success" onClick={() => setFeedbackOpen(true)}>
                {hasFeedback ? t('View Feedback') : t('Submit Feedback')}
              </Button>
            )}
          </Box>
        </Box>
        {showStatusRemark && selectedStatusAction && (
          <Box sx={{ mt: 2 }}>
            <RemarkComponent
              actionName={selectedStatusAction.action}
              onSubmit={handleStatusRemarkSubmit}
              onCancel={handleStatusRemarkCancel}
              textFieldLabel={t('Remark')}
            />
          </Box>
        )}
      </Box>

      {/* HEADER */}
      <Box className="d-flex align-items-end">
        <Box className="d-flex flex-column col-6" >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <UserAvatar name={ticket.assignedTo || 'NA'} size={32} />
            <Typography variant="subtitle1">{ticket.id}</Typography>
          </Box>

          {/* Edit, Cancel, Save buttons */}
          {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {allowEdit && (
            editing ? (
              <>
                <CustomIconButton icon="close" onClick={cancelEditing} />
                <CustomIconButton icon="check" onClick={handleSave} />
              </>
            ) : (
              <CustomIconButton icon="edit" onClick={() => setEditing(true)} />
            )
          )}
          {ticket.statusLabel?.toLowerCase() === 'closed' && (
            <Button size="small" onClick={() => setFeedbackOpen(true)}>
              {hasFeedback ? 'View Feedback' : 'Feedback'}
            </Button>
          )}
        </Box> */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {ticket.category} &gt; {ticket.subCategory}
          </Typography>
        </Box>

        <Box className="d-flex flex-column col-6" >
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            {createdInfo}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0 }}>
            {updatedInfo}
          </Typography>
        </Box>
      </Box>

      {/* SUBJECT */}
      {renderText(subject, setSubject)}
      {/* DESCRIPTION */}
      <Box sx={{ mt: 2 }} className={!editing ? 'border rounded-2 p-2' : ''}>
        {renderText(description, setDescription, true)}
      </Box>

      <div className='d-flex flex-wrap'>
        {/* PRIORITY, SEVERITY */}
        <div className="col-7 mt-4" style={{ minWidth: 'max-content' }}>
          {priority && <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
            <Typography className="me-2" color="text.secondary">{t('Priority')}</Typography>
            {renderSelect(priority, (val: string) => {
              setPriority(val);
              const selected = priorityDetails.find(p => p.level === val);
              setPriorityId(selected ? selected.id : '');
            }, priorityOptions)}
            <InfoIcon content={priorityInfoContent} />
          </Box>}
          {showSeverity && <Box className='align-items-center' sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography className="me-2" color="text.secondary">{t('Severity')}</Typography>
            <Typography>{ticket.severity ? t(ticket.severity) : ''}</Typography>
            <InfoIcon content={severityInfoContent} />
            {!showSeverityToRecommendSeverity
              ? <GenericButton
                variant="contained"
                size="small"
                onClick={() => setSeverityToRecommendSeverity(true)}
                ref={recommendSeverityButtonRef}
              >
                {t('Recommend Severity')}
              </GenericButton>
              : <Box className='col-8 align-items-center' sx={{ display: 'flex', gap: 2 }}>
                <IconComponent icon="keyboardDoubleArrowRight" className='text-muted' />
                <GenericDropdown
                  name="recommendedSeverity"
                  value={recommendedSeverity}
                  onChange={(e: SelectChangeEvent) => setRecommendedSeverity(e.target.value as string)}
                  label={ticket?.recommendedSeverity ? "Recommended Severity" : "Recommend Severity"}
                  options={severityOptions}
                  className="form-select w-25"
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CustomIconButton
                    icon="close"
                    onClick={() => {
                      cancelEditing();
                      setShowRecommendRemark(false);
                      setSeverityToRecommendSeverity(false);
                    }}
                  />
                  {!showRecommendRemark && (
                    <CustomIconButton icon="check" onClick={() => setShowRecommendRemark(true)} />
                  )}
                </Box>
              </Box>}
          </Box>}
          {showRecommendedSeverity && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                <Typography className='me-2' color="text.secondary">{t('Recommended Severity')}</Typography>
                <Typography sx={{ mt: 1 }}>{ticket.recommendedSeverity ? t(ticket.recommendedSeverity) : ''}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{recommendedSeverityByDisplay}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
                <Typography className='me-2' color="text.secondary">{t('Recommended Severity Status')}</Typography>
                <Typography>{recommendedSeverityApprovalText}</Typography>
              </Box>
            </Box>
          )}
          {hasApproveSeverityAction && ticket.recommendedSeverity && (
            <GenericButton
              variant="contained"
              size="small"
              onClick={handleApproveRecommendedSeverity}
              sx={{ mt: 2 }}
            >
              {t('Approve Recommended Severity')}
            </GenericButton>
          )}
        </div>
        {/* ATTACHMENTS */}
        <div className="col-5 mt-4" style={{ minWidth: 'max-content' }}>
          {attachments.length > 0 && (
            <Box className="d-flex justify-content-center" sx={{ mt: 2 }}>
              <ThumbnailList attachments={attachments} thumbnailSize={100} onRemove={handleAttachmentRemove} />
            </Box>
          )}
          <Box className="d-flex justify-content-center" sx={{ mt: 1 }}>
            <FileUpload
              key={uploadKey}
              maxSizeMB={2}
              thumbnailSize={100}
              onFilesChange={handleAttachmentUpload}
              attachments={emptyFileList}
            />
          </Box>
        </div>
      </div>

      {showHistory && (
        <CustomFieldset title={t('History')} style={{ marginTop: 16, margin: 0, padding: 0 }}>
          <Histories ticketId={ticketId} />
        </CustomFieldset>
      )}


      {/* SLA */}
      {sla && (
        <CustomFieldset title="SLA" className="mt-4" style={{ margin: 0, padding: 0 }}>
          {/* SLA PROGRESS BAR */}
          <Box sx={{ mt: 4, width: { xs: '100%', md: '70%' }, mx: 'auto', display: 'flex', justifyContent: 'center' }}>
            <SlaProgressBar sla={sla} className="w-100" />
          </Box>
          <SlaDetails sla={sla} />
        </CustomFieldset>
      )}
      <CustomFieldset title={t('Comment')} className="mt-4" style={{ margin: 0, padding: 0 }}>
        <CommentsSection ticketId={ticketId} />
      </CustomFieldset>
      <FeedbackModal open={feedbackOpen} ticketId={ticketId} onClose={handleFeedbackClose} feedbackStatus={ticket.feedbackStatus} />
      <RemarkComponent
        isModal
        open={showRecommendRemark}
        actionName={t('Recommend Severity')}
        title={t('Recommend Severity Remark')}
        textFieldLabel={t('Remark')}
        onCancel={() => setShowRecommendRemark(false)}
        onSubmit={handleSubmitRecommendSeverity}
      />
    </Box>
  );

  // DESIGN 2
  // return (
  //   <Box sx={{ width: '100%', position: 'relative', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
  //     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  //         <UserAvatar name={ticket.assignedTo || 'NA'} size={32} />
  //         <Typography variant="subtitle1">{ticket.id}</Typography>
  //       </Box>
  //       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  //         {allowEdit && (
  //           editing ? (
  //             <>
  //               <CustomIconButton icon="close" onClick={cancelEditing} />
  //               <CustomIconButton icon="check" onClick={handleSave} />
  //             </>
  //           ) : (
  //             <CustomIconButton icon="edit" onClick={() => setEditing(true)} />
  //           )
  //         )}
  //         {ticket.statusLabel?.toLowerCase() === 'closed' && (
  //           <Button size="small" onClick={() => setFeedbackOpen(true)}>
  //             {hasFeedback ? 'View Feedback' : 'Feedback'}
  //           </Button>
  //         )}
  //       </Box>
  //     </Box>
  //     <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
  //       {ticket.category} &gt; {ticket.subCategory}
  //     </Typography>
  //     {renderText(subject, setSubject)}
  //     <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
  //       {createdInfo}
  //     </Typography>
  //     <Typography variant="caption" color="text.secondary" sx={{ mt: 0 }}>
  //       {updatedInfo}
  //     </Typography>
  //     <Box sx={{ mt: 2 }} className={!editing ? 'border rounded-2 p-2' : ''}>
  //       {renderText(description, setDescription, true)}
  //     </Box>
  //     {attachments.length > 0 && (
  //       <Box sx={{ mt: 2 }}>
  //         <ThumbnailList attachments={attachments} thumbnailSize={100} onRemove={handleAttachmentRemove} />
  //       </Box>
  //     )}
  //     <Box sx={{ mt: 1 }}>
  //       <FileUpload
  //         key={uploadKey}
  //         maxSizeMB={5}
  //         thumbnailSize={100}
  //         onFilesChange={handleAttachmentUpload}
  //         attachments={emptyFileList}
  //       />
  //     </Box>
  //     <Box sx={{ mt: 2 }}>
  //       {priority && <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
  //         <Typography className="me-2" color="text.secondary">{t('Priority')}</Typography>
  //         {renderSelect(priority, (val: string) => {
  //           setPriority(val);
  //           const selected = priorityDetails.find(p => p.level === val);
  //           setPriorityId(selected ? selected.id : '');
  //         }, priorityOptions)}
  //         <InfoIcon content={priorityInfoContent} />
  //       </Box>}
  //       {showSeverity && <Box className='align-items-center' sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
  //         <Typography className="me-2" color="text.secondary">{t('Severity')}</Typography>
  //         <Typography>{ticket.severity ? t(ticket.severity) : ''}</Typography>
  //         <InfoIcon content={severityInfoContent} />
  //         {!showSeverityToRecommendSeverity
  //           ? <GenericButton
  //             variant="contained"
  //             size="small"
  //             onClick={() => setSeverityToRecommendSeverity(true)}
  //           >
  //             {t('Recommend Severity')}
  //           </GenericButton>
  //           : <Box className='col-8 align-items-center' sx={{ display: 'flex', gap: 2 }}>
  //             <IconComponent icon="keyboardDoubleArrowRight" className='text-muted' />
  //             <GenericDropdown
  //               name="recommendedSeverity"
  //               value={recommendedSeverity}
  //               onChange={(e: SelectChangeEvent) => setRecommendedSeverity(e.target.value as string)}
  //               label={ticket?.recommendedSeverity ? "Recommended Severity" : "Recommend Severity"}
  //               options={severityOptions}
  //               className="form-select w-25"
  //             />
  //             <Box sx={{ display: 'flex', gap: 1 }}>
  //               <CustomIconButton
  //                 icon="close"
  //                 onClick={() => {
  //                   cancelEditing();
  //                   setShowRecommendRemark(false);
  //                   setSeverityToRecommendSeverity(false);
  //                 }}
  //               />
  //               {!showRecommendRemark && (
  //                 <CustomIconButton icon="check" onClick={() => setShowRecommendRemark(true)} />
  //               )}
  //             </Box>
  //           </Box>}
  //       </Box>}
  //       {showRecommendedSeverity && (
  //         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
  //           <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
  //             <Typography className='me-2' color="text.secondary">{t('Recommended Severity')}</Typography>
  //             <Typography sx={{ mt: 1 }}>{ticket.recommendedSeverity ? t(ticket.recommendedSeverity) : ''}</Typography>
  //             <Typography color="text.secondary" sx={{ mt: 1 }}>{recommendedSeverityByDisplay}</Typography>
  //           </Box>
  //           <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
  //             <Typography className='me-2' color="text.secondary">{t('Recommended Severity Status')}</Typography>
  //             <Typography>{recommendedSeverityApprovalText}</Typography>
  //           </Box>
  //         </Box>
  //       )}
  //       {hasApproveSeverityAction && ticket.recommendedSeverity && (
  //         <GenericButton
  //           variant="contained"
  //           size="small"
  //           onClick={handleApproveRecommendedSeverity}
  //           sx={{ mt: 2 }}
  //         >
  //           {t('Approve Recommended Severity')}
  //         </GenericButton>
  //       )}
  //     </Box>
  //     {showHistory && (
  //       <CustomFieldset title={t('History')} style={{ marginTop: 16, margin: 0, padding: 0 }}>
  //         <Histories ticketId={ticketId} />
  //       </CustomFieldset>
  //     )}
  //     {sla && (
  //       <CustomFieldset title="SLA" className="mt-4" style={{ margin: 0, padding: 0 }}>
  //         <SlaDetails sla={sla} />
  //       </CustomFieldset>
  //     )}
  //     <CustomFieldset title={t('Comment')} className="mt-4" style={{ margin: 0, padding: 0 }}>
  //       <CommentsSection ticketId={ticketId} />
  //     </CustomFieldset>
  //     <FeedbackModal open={feedbackOpen} ticketId={ticketId} onClose={() => setFeedbackOpen(false)} />
  //     <RemarkComponent
  //       isModal
  //       open={showRecommendRemark}
  //       actionName={t('Recommend Severity')}
  //       title={t('Recommend Severity Remark')}
  //       textFieldLabel={t('Remark')}
  //       onCancel={() => setShowRecommendRemark(false)}
  //       onSubmit={handleSubmitRecommendSeverity}
  //     />
  //   </Box>
  // );
};

export default TicketView;

