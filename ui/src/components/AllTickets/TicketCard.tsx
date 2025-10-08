import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Tooltip, Menu, MenuItem, ListItemIcon, Chip, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';
import CustomIconButton, { IconComponent } from '../UI/IconButton/CustomIconButton';
import { TicketStatusWorkflow } from '../../types';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { getStatusNameById, getStatusColorById, truncateWithEllipsis } from '../../utils/Utils';
import PriorityIcon from '../UI/Icons/PriorityIcon';
import RemarkComponent from '../UI/Remark/RemarkComponent';
import { updateTicket } from '../../services/TicketService';
import { useApi } from '../../hooks/useApi';
import { getCurrentUserDetails } from '../../config/config';
import { useTranslation } from 'react-i18next';

export interface TicketCardData {
    id: string;
    subject: string;
    description?: string;
    category: string;
    subCategory: string;
    priority: string;
    isMaster: boolean;
    userId?: string;
    requestorName?: string;
    assignedTo?: string;
    assignedToName?: string;
    statusId?: string;
}

interface PriorityConfig {
    // Define the properties of PriorityConfig as needed, for example:
    color: string;
    label: string;
}

interface TicketCardProps {
    ticket: TicketCardData;
    priorityConfig?: Record<string, PriorityConfig>;
    onClick?: () => void;
    statusWorkflows: Record<string, TicketStatusWorkflow[]>;
    searchCurrentTicketsPaginatedApi: (id: string) => void;
}
const priorityMap: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };

const TicketCard: React.FC<TicketCardProps> = ({ ticket, priorityConfig, onClick, statusWorkflows, searchCurrentTicketsPaginatedApi }) => {
    const [hover, setHover] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [actions, setActions] = useState<TicketStatusWorkflow[]>([]);
    const navigate = useNavigate();
    const [showActionRemark, setShowActionRemark] = useState(false);
    const [selectedAction, setSelectedAction] = useState<TicketStatusWorkflow | null>(null);
    const { apiHandler: updateTicketApiHandler } = useApi<any>();
    const { t } = useTranslation();

    const disallowed = ['Assign', 'Further Assign', 'Assign / Assign Further'];

    const getAvailableActions = (statusId?: string) =>
        (statusWorkflows[statusId || ''] || []).filter(a => !disallowed.includes(a.action));

    const allowAssigneeChange = (statusId?: string) =>
        (statusWorkflows[statusId || ''] || []).some(a => disallowed.includes(a.action));

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'Assign':
                return { icon: 'personAddAlt' };
            case 'Resolve':
                return { icon: 'check', className: 'icon-blue' };
            case 'Cancel/ Reject':
                return { icon: 'close', className: 'icon-red' };
            case 'On Hold (Pending with Requester)':
            case 'On Hold (Pending with Service Provider)':
            case 'On Hold (Pending with FCI)':
                return { icon: 'pause', className: 'icon-yellow' };
            case 'Approve Escalation':
                return { icon: 'moving' };
            case 'Recommend Escalation':
                return { icon: 'northEast' };
            case 'Close':
                return { icon: 'doneAll', className: 'icon-green' };
            case 'Reopen':
                return { icon: 'replay' };
            case 'Start':
                return { icon: 'playArrow' };
            case 'Escalate':
                return { icon: 'arrowUpward' };
            default:
                return { icon: 'done', className: 'icon-green' };
        }
    };

    const openMenu = (event: React.MouseEvent, record: TicketCardData) => {
        event.stopPropagation();
        const list = getAvailableActions(record.statusId);
        setActions(list);
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleActionClick = (wf: TicketStatusWorkflow, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedAction(wf);
        setShowActionRemark(true);
        handleClose();
    };

    const handleSubmitRemark = (remark: string) => {
        const id = ticket.id;
        const reqPayload = {
            updatedBy: getCurrentUserDetails()?.username,
            status: { statusId: String(selectedAction?.nextStatus) },
            remark,
        } as any;
        updateTicketApiHandler(() => updateTicket(id, reqPayload)).then(() => {
            searchCurrentTicketsPaginatedApi(ticket.id);
            cancelAction();
        });

    }

    const cancelAction = () => {
        setShowActionRemark(false);
        setSelectedAction(null);
    };

    const recordActions = getAvailableActions(ticket.statusId);
    const statusName = getStatusNameById(ticket.statusId || '') || '';
    const translatedStatusName = statusName ? t(statusName) : '';
    const displayStatusName = translatedStatusName || statusName;
    const statusColor = getStatusColorById(ticket.statusId || '') || undefined;
    const truncatedStatus = displayStatusName.length > 12 ? `${displayStatusName.slice(0, 12)}...` : displayStatusName;
    const resumeAction = recordActions.find(a => a.action === 'Resume');
    const showSubmit = resumeAction && (statusName === 'On Hold (Pending with Requester)' || statusName === 'On Hold (Pending with FCI)');

    return (
        <Card
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            sx={{ cursor: 'pointer', border: '1px solid', borderColor: 'grey.300', boxShadow: 'none', height: '100%', position: 'relative', transition: 'background-color 0.2s, transform 0.2s', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', transform: 'scale(1.02)' }, borderRadius: 2 }}
        >
            <CardContent sx={{ pb: 6 }}>
                <Typography color="text.secondary" sx={{ fontSize: '8px' }} title={ticket.id}>
                    {truncateWithEllipsis(ticket.id, 12)}
                </Typography>
                <Typography sx={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                    <span style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ticket.subject}>{ticket.subject}</span>
                </Typography>
                <Tooltip
                    title={<React.Fragment><div>Category: {ticket.category}</div><div>Sub-Category: {ticket.subCategory}</div></React.Fragment>}
                >
                    <Typography
                        color="text.secondary"
                        sx={{ fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span>{ticket.category} &gt; {ticket.subCategory}</span>
                        {ticket.isMaster && <MasterIcon />}
                    </Typography>
                </Tooltip>
                <Typography sx={{ fontSize: '12px', mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={ticket.description}>
                    {ticket.description}
                </Typography>
            </CardContent>
            <Box sx={{ position: 'absolute', top: 8, right: 8 }} onClick={(e) => e.stopPropagation()}>
                {allowAssigneeChange(ticket.statusId)
                    ? <AssigneeDropdown
                        ticketId={ticket.id}
                        assigneeName={ticket.assignedToName || ticket.assignedTo}
                        requestorId={ticket.userId}
                        searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
                    />
                    : (ticket.assignedToName || ticket.assignedTo)
                        ? <Tooltip title={ticket.assignedToName || ticket.assignedTo}>
                            <span><UserAvatar name={ticket.assignedToName || ticket.assignedTo} /></span>
                        </Tooltip>
                        : null
                }
            </Box>
            {hover && (
                <Box sx={{ position: 'absolute', bottom: 4, right: 4, display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <VisibilityIcon
                        onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${ticket.id}`); }}
                        fontSize="small"
                        sx={{ color: 'grey.600', cursor: 'pointer' }}
                    />
                    {showSubmit ? (
                        <Button size="small" onClick={(e) => handleActionClick(resumeAction!, e)}>Submit</Button>
                    ) : recordActions.length <= 2 ? (
                        recordActions.map(a => {
                            const { icon, className } = getActionIcon(a.action);
                            return (
                                <Tooltip key={a.id} title={a.action} placement="top">
                                    <CustomIconButton
                                        size="small"
                                        icon={icon}
                                        className={className}
                                        onClick={(e) => handleActionClick(a, e)}
                                    />
                                </Tooltip>
                            );
                        })
                    ) : (
                        <CustomIconButton icon="moreVert" onClick={(e) => openMenu(e, ticket)} />
                    )}
                </Box>
            )}
            <Box sx={{ position: 'absolute', bottom: 4, left: 4, display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                {statusName && (
                    <Tooltip title={displayStatusName}>
                        <Chip
                            label={truncatedStatus}
                            size="small"
                            sx={{ fontSize: '8px', height: 18, cursor: 'default', bgcolor: statusColor, color: '#fff' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Tooltip>
                )}
                <Tooltip title={ticket.priority}>
                    <PriorityIcon level={priorityMap[ticket.priority] || 0} priorityText={ticket?.priority} rotateRight />
                </Tooltip>
            </Box>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} onClick={(e) => e.stopPropagation()}>
                {actions.map(a => {
                    const { icon, className } = getActionIcon(a.action);
                    return (
                        <MenuItem key={a.id} onClick={(e) => handleActionClick(a, e)}>
                            <ListItemIcon>
                                <IconComponent icon={icon} className={className} />
                            </ListItemIcon>
                            {a.action}
                        </MenuItem>
                    );
                })}
            </Menu>
            {showActionRemark && selectedAction && (
                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'grey.300' }} onClick={(e) => e.stopPropagation()}>
                    <RemarkComponent
                        actionName={selectedAction.action}
                        onCancel={cancelAction}
                        onSubmit={handleSubmitRemark}
                    />
                </Box>
            )}
        </Card>
    );
};

export default TicketCard;
