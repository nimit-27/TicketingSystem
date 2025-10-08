import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Typography, TextField, MenuItem, Select, SelectChangeEvent, Button } from '@mui/material';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { useApi } from '../../hooks/useApi';
import { getTicket, updateTicket, addAttachments, deleteAttachment, getTicketSla, getChildTickets, unlinkTicketFromMaster } from '../../services/TicketService';
import { getRootCauseAnalysisTicketById } from '../../services/RootCauseAnalysisService';
import { BASE_URL } from '../../services/api';
import { getCurrentUserDetails } from '../../config/config';
import { getPriorities } from '../../services/PriorityService';
import { getSeverities } from '../../services/SeverityService';
import InfoIcon from '../UI/Icons/InfoIcon';
import GenericButton from '../UI/Button';
import { PriorityInfo, SeverityInfo, TicketSla, TicketStatusWorkflow, RootCauseAnalysis } from '../../types';
import CustomIconButton, { IconComponent } from '../UI/IconButton/CustomIconButton';
import CommentsSection from '../Comments/CommentsSection';
import SlaDetails from './SlaDetails';
import Histories from '../../pages/Histories';
import CustomFieldset from '../CustomFieldset';
import { useTranslation } from 'react-i18next';
import { checkAccessMaster, checkFieldAccess } from '../../utils/permissions';
import FileUpload, { ThumbnailList } from '../UI/FileUpload';
import FeedbackModal from '../Feedback/FeedbackModal';
import { getFeedback } from '../../services/FeedbackService';
import { getStatusWorkflowMappings } from '../../services/StatusService';
import GenericDropdown, { DropdownOption } from '../UI/Dropdown/GenericDropdown';
import RemarkComponent from '../UI/Remark/RemarkComponent';
import { getDropdownOptions, getStatusNameById } from '../../utils/Utils';
import SlaProgressChart from './SlaProgressChart';
import { getCategories, getSubCategories } from '../../services/CategoryService';
import { useLocation, useNavigate } from 'react-router-dom';
import RootCauseAnalysisModal from './RootCauseAnalysisModal';
import ChildTicketsTable from '../Ticket/ChildTicketsTable';
import type { TicketRow } from '../AllTickets/TicketsTable';
import { useSnackbar } from '../../context/SnackbarContext';
import ChildTicketsList from './ChildTicketsList';
import LinkToMasterTicketModal from '../RaiseTicket/LinkToMasterTicketModal';

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

  // Determine page context and track RCA status
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  // const rcaStatusFromLocation = (location.state as any)?.rcaStatus ?? '';
  const [rcaStatus, setRcaStatus] = useState('');

  const pageType = pathname.includes('root-cause-analysis') ? 'RCA' : 'Ticket';

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
  const [categoryOptions, setCategoryOptions] = useState<DropdownOption[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<DropdownOption[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const [sla, setSla] = useState<TicketSla | null>(null);
  const [masterSla, setMasterSla] = useState<TicketSla | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  // const [statusWorkflows, setStatusWorkflows] = useState<Record<string, TicketStatusWorkflow[]>>({});
  const [statusWorkflows, setStatusWorkflows] = useState<any>({});
  const [severityToRecommendSeverity, setSeverityToRecommendSeverity] = useState<boolean>(false);
  const [showRecommendRemark, setShowRecommendRemark] = useState(false);
  const [showStatusRemark, setShowStatusRemark] = useState(false);
  const [selectedStatusAction, setSelectedStatusAction] = useState<TicketStatusWorkflow | null>(null);
  const recommendSeverityButtonRef = useRef<HTMLButtonElement | null>(null);
  const [rcaData, setRcaData] = useState<RootCauseAnalysis | null>(null);
  const [isRcaModalOpen, setIsRcaModalOpen] = useState(false);
  const [linkToMasterTicketModalOpen, setLinkToMasterTicketModalOpen] = useState(false);
  const emptyFileList = useMemo<File[]>(() => [], []);

  const { showMessage } = useSnackbar();
  const currentUserDetails = useMemo(() => getCurrentUserDetails(), []);
  const currentUsername = currentUserDetails?.username || '';
  const currentUserId = currentUserDetails?.userId || '';
  const roleList = useMemo<string[]>(() => currentUserDetails?.role ?? [], [currentUserDetails]);

  const normalizedRoles = useMemo(() => roleList.map(role => role.toUpperCase()), [roleList]);
  const isItManager = roleList.includes('9');
  const isRno = roleList.includes('4');

  const handleLinkToMasterTicketModalClose = useCallback(() => {
    setLinkToMasterTicketModalOpen(false);
  }, []);

  const handleLinkToMasterTicketModalOpen = useCallback(() => {
    setLinkToMasterTicketModalOpen(true);
  }, []);

  const handleMasterLinkSuccess = useCallback(async (masterTicketId: string) => {
    await getTicketHandler(() => getTicket(ticketId));
    showMessage(`Ticket ${ticketId} has been linked to master ticket ${masterTicketId}`, 'success');
  }, [getTicketHandler, ticketId, showMessage]);

  const noopSetMasterId = useCallback((_id: string) => {
    // Intentionally left blank for existing tickets
  }, []);

  const getSeverityText = useCallback((value?: string | null) => {
    if (!value) {
      return '';
    }
    const normalized = value.toUpperCase();
    if (normalized.includes('CRITICAL') || normalized === 'S1') {
      return 'Critical';
    }
    if (normalized.includes('HIGH') || normalized === 'S2') {
      return 'High';
    }
    if (normalized.includes('MEDIUM') || normalized === 'S3') {
      return 'Medium';
    }
    return value;
  }, []);

  // DROPDOWN OPTIONS - getDropdownOptions(arr, label, value)
  // const severityOptions: DropdownOption[] = severityList.map((s: SeverityInfo) => ({ label: s.level, value: s.level }));
  const severityOptions: DropdownOption[] = getDropdownOptions(severityList, 'level', 'id');

  // ACTIONS ACCORDING TO STATUS WORKFLOW
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

  const recommendSeverityAction = useMemo(
    () => availableStatusActions.find((action: TicketStatusWorkflow) => action.action === 'Recommend Escalation') || null,
    [availableStatusActions]
  );

  // PERMISSION BOOLEANS
  const ticketViewPermissions = checkAccessMaster(['ticketView']);
  const showSubmitRCAButton = checkAccessMaster(['ticketView', 'submitRCAButton'])
  const showViewRCAButton = checkAccessMaster(['ticketView', 'viewRCAButton'])
  const showLinkToMasterTicketButton = checkAccessMaster(['ticketView', 'linkToMasterTicketButton']);
  const allowEdit = checkFieldAccess('ticketDetails', 'editMode');
  const showRecommendedSeverity = checkFieldAccess('ticketDetails', 'recommendedSeverity') && ticket?.recommendedSeverity;
  const showRecommendSeverity = checkFieldAccess('ticketDetails', 'recommendSeverity');
  const showSeverity = checkFieldAccess('ticketDetails', 'severity');
  const showSeverityToRecommendSeverity = showSeverity && severityToRecommendSeverity

  const fetchSubCategoriesList = useCallback(async (categoryValue: string) => {
    if (!categoryValue) {
      setSubCategoryOptions([]);
      return [];
    }

    try {
      const response = await getSubCategories(categoryValue);
      const rawPayload = response?.data ?? response;
      const payload = rawPayload?.body?.data ?? rawPayload;
      const subCategories = Array.isArray(payload) ? payload : [];
      setSubCategoryOptions(getDropdownOptions(subCategories, 'subCategory', 'subCategoryId'));
      return subCategories;
    } catch {
      setSubCategoryOptions([]);
      return [];
    }
  }, []);

  useEffect(() => {
    if (ticketId) {

      const ticketFetcher = pageType === 'RCA'
        ? () => getRootCauseAnalysisTicketById(ticketId)
        : () => getTicket(ticketId);

      getTicketHandler(ticketFetcher);
      getPriorities().then(res => {
        const priorityData = Array.isArray(res?.data?.body?.data) ? res.data?.body?.data : [];
        setPriorityOptions(priorityData.map((p: PriorityInfo) => p.level));
        setPriorityDetails(priorityData);
      });
      getSeverities().then(res => {
        const severityData = Array.isArray(res?.data) ? res.data : [];
        setSeverityList(severityData);
      });
      getCategories()
        .then(res => {
          const rawPayload = res?.data ?? res;
          const payload = rawPayload?.body?.data ?? rawPayload;
          const categories = Array.isArray(payload) ? payload : [];
          setCategoryOptions(getDropdownOptions(categories, 'category', 'categoryId'));
        })
        .catch(() => {
          setCategoryOptions([]);
        });

      getTicketSla(ticketId)
        .then(res => {
          const body = res.data?.body ?? res.data;
          const slaData = res.status === 200 ? body?.data ?? null : null;
          const normalised = normaliseSla(slaData && typeof slaData === 'object' ? slaData as TicketSla : null);
          setSla(normalised);
        })
        .catch(() => setSla(null));
    }
  }, [ticketId, pageType, getTicketHandler, workflowApiHandler]);

  useEffect(() => {
    const masterTicketId = ticket?.masterId;
    if (!masterTicketId || masterTicketId === ticketId) {
      setMasterSla(null);
      return;
    }

    getTicketSla(masterTicketId)
      .then(res => {
        const body = res.data?.body ?? res.data;
        const slaData = res.status === 200 ? body?.data ?? null : null;
        const normalised = normaliseSla(slaData && typeof slaData === 'object' ? slaData as TicketSla : null);
        setMasterSla(normalised);
      })
      .catch(() => setMasterSla(null));
  }, [ticket?.masterId, ticketId]);

  useEffect(() => {
    workflowApiHandler(() => getStatusWorkflowMappings(roleList));
  }, [roleList])


  useEffect(() => {
    if (ticket) {
      setSubject(ticket.subject || '');
      setDescription(ticket.description || '');
      setPriority(ticket.priority || '');
      setPriorityId(ticket.priorityId || '');
      setSeverity(ticket.severity || '');
      setRecommendedSeverity(ticket.recommendedSeverity || '');
      setSelectedCategoryId('');
      setSelectedSubCategoryId('');
      setSubCategoryOptions([]);
      if (Array.isArray(ticket.attachmentPaths) && ticket.attachmentPaths.length > 0) {
        setAttachments(ticket.attachmentPaths.map((att: string) => `${BASE_URL}/uploads/${att}`));
      } else {
        setAttachments([]);
      }
      if (ticket.statusLabel?.toLowerCase() === 'closed') {
        getFeedback(ticketId)
          .then(res => setHasFeedback(Boolean(res.data)))
          .catch(() => setHasFeedback(false));
      }
      setRcaStatus(ticket.rcaStatus || '');
    } else {
      setRcaStatus('');
    }
  }, [ticket]);

  useEffect(() => {
    if (!editing) {
      setSelectedCategoryId('');
      setSelectedSubCategoryId('');
      setSubCategoryOptions([]);
      return;
    }

    if (!ticket || !categoryOptions.length) {
      return;
    }

    const matchedCategory = categoryOptions.find(opt => opt.value === ticket.categoryId || opt.label === ticket.category);
    const categoryValue = matchedCategory?.value ?? '';
    setSelectedCategoryId(categoryValue);

    if (!categoryValue) {
      setSelectedSubCategoryId('');
      setSubCategoryOptions([]);
      return;
    }

    let isActive = true;
    fetchSubCategoriesList(categoryValue).then(subCategories => {
      if (!isActive) {
        return;
      }
      const matchedSubCategory = subCategories.find((sub: any) => sub.subCategoryId === ticket.subCategoryId || sub.subCategory === ticket.subCategory);
      setSelectedSubCategoryId(matchedSubCategory?.subCategoryId ?? '');
    });

    return () => {
      isActive = false;
    };
  }, [editing, ticket, categoryOptions, fetchSubCategoriesList]);

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
    if (selectedCategoryId) {
      payload.category = selectedCategoryId;
    }
    if (selectedSubCategoryId) {
      payload.subCategory = selectedSubCategoryId;
    }
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

  const renderText = (
    value: string,
    onChange: (v: string) => void,
    multiline?: boolean,
    options?: { editing?: boolean },
  ) => {
    const isEditing = options?.editing ?? editing;
    return isEditing ? (
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
    );
  };

  const renderSelect = (
    value: string,
    setValue: (v: string) => void,
    options: string[] | DropdownOption[],
    config: { displayValue?: string; translate?: boolean; disabled?: boolean } = {}
  ) => (
    editing ? (
      <Select
        value={value || ''}
        onChange={(e: SelectChangeEvent) => setValue(e.target.value as string)}
        fullWidth
        size="small"
        disabled={config.disabled}
      >
        {(Array.isArray(options) && options.length > 0)
          ? (options as (string | DropdownOption)[]).map(option => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            const label = config.translate === false ? optionLabel : t(optionLabel);
            return (
              <MenuItem key={optionValue || optionLabel} value={optionValue}>
                {label}
              </MenuItem>
            );
          })
          : <MenuItem key="" value="">{t('None')}</MenuItem>}
      </Select>
    ) : (
      <Typography sx={{ mt: 1 }}>
        {config.displayValue
          ? (config.translate === false ? config.displayValue : t(config.displayValue))
          : value
            ? (config.translate === false ? value : t(value))
            : ' - '}
      </Typography>
    )
  );

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

  const handleOpenSubmitRca = useCallback(() => {
    setIsRcaModalOpen(true);
  }, []);

  const handleOpenViewRca = useCallback(() => {
    setIsRcaModalOpen(true);
  }, []);

  const handleRcaModalClose = useCallback(() => {
    setIsRcaModalOpen(false);
  }, []);

  const currentStatusName = useMemo(() => {
    if (!ticket) return '';
    const statusName = ticket.statusId ? getStatusNameById(ticket.statusId) : '';
    return (statusName || ticket.statusLabel || '').trim();
  }, [ticket]);

  const normalisedStatusName = (currentStatusName || '').toLowerCase();
  const isAssignedStatus = normalisedStatusName.includes('assigned');
  const isResolvedStatus = normalisedStatusName === 'resolved';
  const isClosedStatus = normalisedStatusName === 'closed';
  const isTeamLeadRole = normalizedRoles.some(role => role === 'TEAM_LEAD' || role === 'TL' || role === 'TEAMLEAD');
  const isLevelAgent = normalizedRoles.some(role => role === 'L1' || role === 'L2');
  // const showRCAButton = isClosedStatus && (isTeamLeadRole || isLevelAgent);

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
  const shouldShowSubmitRcaButton = showSubmitRCAButton && rcaStatus === 'PENDING';
  const shouldShowViewRcaButton = showViewRCAButton && rcaStatus === 'SUBMITTED';
  const shouldShowLinkToMasterTicketButton = showLinkToMasterTicketButton && !isResolvedStatus && !isClosedStatus;
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

  const pendingApprovalText = t('Pending Approval');
  const recommendedSeverityBy = ticket?.severityRecommendedBy;
  const recommendedSeverityByText = recommendedSeverityBy || ' - ';
  const recommendedSeverityStatus = ticket?.recommendedSeverityStatus;
  const severityApprovedBy = ticket?.severityApprovedBy;
  const severityApprovedByText = severityApprovedBy || ' - ';
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
          p: 1,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <div className='d-flex'>
            <Typography className="me-1" variant="subtitle2" color="text.primary">
              {t('Ticket')}
            </Typography>
            <Typography variant="subtitle2" color="text.primary">
              {currentStatusName ? t(currentStatusName) : '-'}
            </Typography>
          </div>
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
            {shouldShowSubmitRcaButton && (
              <Button size="small" variant="contained" color="success" onClick={handleOpenSubmitRca}>
                {t('Submit RCA')}
              </Button>
            )}
            {shouldShowViewRcaButton && (
              <Button size="small" variant="contained" color="success" onClick={handleOpenViewRca}>
                {t('View RCA')}
              </Button>
            )}
            {shouldShowLinkToMasterTicketButton && (
              <Button size="small" variant="outlined" onClick={handleLinkToMasterTicketModalOpen}>
                {t('Link to a Master Ticket')}
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

      {!ticket.isMaster && ticket.masterId && ticket.masterId.trim() !== '' && ticket.masterId !== ticket.id && (
        <Alert
          severity="info"
          sx={{ mb: 2, cursor: 'pointer' }}
          onClick={() => navigate(`/tickets/${ticket.masterId}`)}
        >
          Linked to master ticket ID {ticket.masterId}. Click to view master ticket.
        </Alert>
      )}

      {/* HEADER */}
      <Box className="d-flex align-items-end">
        <Box className="d-flex flex-column col-6" >
          <div className='d-flex'>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <UserAvatar name={ticket.assignedToName || ticket.assignedTo || 'NA'} size={32} />
              <Typography variant="subtitle1">{ticket.id}</Typography>
            </Box>

            {/* Edit, Cancel, Save buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              {ticket.statusLabel?.toLowerCase() === 'closed' && isRequester && (
                <Button size="small" onClick={() => setFeedbackOpen(true)}>
                  {hasFeedback ? 'View Feedback' : 'Feedback'}
                </Button>
              )}
            </Box>
          </div>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {ticket.category} &gt; {ticket.subCategory}
          </Typography>
        </Box>


        <Box className="d-flex flex-column col-6" >
          <Typography className='d-flex justify-content-end' variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            {createdInfo}
          </Typography>
          <Typography className='d-flex justify-content-end' variant="caption" color="text.secondary" sx={{ mt: 0 }}>
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
        {/* CATEGORY, SUB-CATEGORY */}
        <Box sx={{ mt: 1, display: 'flex', flexWrap: '', gap: 2 }}>
          {editing && <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography color="text.secondary">{t('Category')}</Typography>
              {renderSelect(
                selectedCategoryId,
                (val: string) => {
                  setSelectedCategoryId(val);
                  setSelectedSubCategoryId('');
                  if (!val) {
                    setSubCategoryOptions([]);
                    return;
                  }
                  setSubCategoryOptions([]);
                  fetchSubCategoriesList(val);
                },
                categoryOptions,
                {
                  displayValue: ticket.category,
                  translate: false,
                  disabled: !categoryOptions.length
                }
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography color="text.secondary">{t('Sub-Category')}</Typography>
              {renderSelect(
                selectedSubCategoryId,
                (val: string) => setSelectedSubCategoryId(val),
                subCategoryOptions,
                {
                  displayValue: ticket.subCategory,
                  translate: false,
                  disabled: !selectedCategoryId
                }
              )}
            </Box>
          </>}
        </Box>
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
            {recommendSeverityAction
              ? !showSeverityToRecommendSeverity
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
                </Box>
              : null}
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
              hideUploadButton={isClosedStatus || isResolvedStatus}
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
      {(sla || masterSla) && (
        <CustomFieldset title="SLA" className="mt-4" style={{ margin: 0, padding: 0 }}>
          {sla && (
            <>
              <Box sx={{ mt: 4, width: { xs: '100%', md: '70%' }, mx: 'auto', display: 'flex', justifyContent: 'center' }}>
                <SlaProgressChart sla={sla} className="w-100" />
              </Box>
              <SlaDetails sla={sla} />
            </>
          )}
          {masterSla && (
            <Box sx={{ mt: sla ? 6 : 4 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>
                SLA for master ticket ID {ticket?.masterId}
              </Typography>
              <Box sx={{ width: { xs: '100%', md: '70%' }, mx: 'auto', display: 'flex', justifyContent: 'center' }}>
                <SlaProgressChart sla={masterSla} className="w-100" />
              </Box>
              <SlaDetails sla={masterSla} />
            </Box>
          )}
        </CustomFieldset>
      )}

      {/* CHILD TICKETS LIST */}
      {ticket.isMaster && (
        <CustomFieldset title={t('Child Tickets')} className="mt-4" style={{ margin: 0, padding: 0 }}>
          <ChildTicketsList parentId={ticket.id} />
        </CustomFieldset>
      )}

      {/* COMMENTS */}
      <CustomFieldset title={t('Comment')} className="mt-4" style={{ margin: 0, padding: 0 }}>
        <CommentsSection ticketId={ticketId} />
      </CustomFieldset>

      <LinkToMasterTicketModal
        open={linkToMasterTicketModalOpen}
        onClose={handleLinkToMasterTicketModalClose}
        setMasterId={noopSetMasterId}
        subject={ticket.subject || ''}
        currentTicketId={ticket.id}
        masterId={ticket.masterId}
        onLinkSuccess={handleMasterLinkSuccess}
      />

      {/* MODAL - FEEDBACK */}
      <FeedbackModal open={feedbackOpen} ticketId={ticketId} onClose={handleFeedbackClose} feedbackStatus={ticket.feedbackStatus} />

      {/* MODAL - ROOT CAUSE ANALYSIS */}
      <RootCauseAnalysisModal
        open={isRcaModalOpen}
        onClose={handleRcaModalClose}
        rcaStatus={rcaStatus}
        ticketId={ticketId}
        updatedBy={currentUsername}
      />

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

