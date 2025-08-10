import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Tooltip, Menu, MenuItem, ListItemIcon, Chip, TextField, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';
import CustomIconButton, { IconComponent } from '../UI/IconButton/CustomIconButton';
import { TicketStatusWorkflow } from '../../types';
import { useApi } from '../../hooks/useApi';
import { updateTicket } from '../../services/TicketService';
import { getCurrentUserDetails } from '../../config/config';
import { useNavigate } from 'react-router-dom';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { getStatusNameById, getStatusColorById } from '../../utils/Utils';
import PriorityBar from './PriorityBar';

export interface TicketCardData {
    id: string;
    subject: string;
    description?: string;
    category: string;
    subCategory: string;
    priority: string;
    isMaster: boolean;
    requestorName?: string;
    assignedTo?: string;
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
const TicketCard: React.FC<TicketCardProps> = ({ ticket, priorityConfig, onClick, statusWorkflows, searchCurrentTicketsPaginatedApi }) => {
    const priorityMap: Record<string, number> = { Low: 1, Medium: 2, High: 3, Critical: 4 };
    const [hover, setHover] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [actions, setActions] = useState<TicketStatusWorkflow[]>([]);
    const { apiHandler: updateTicketApiHandler } = useApi<any>();
    const navigate = useNavigate();
    const [showRemark, setShowRemark] = useState(false);
    const [selectedAction, setSelectedAction] = useState<TicketStatusWorkflow | null>(null);
    const [remark, setRemark] = useState('');

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
        setShowRemark(true);
        setRemark('');
        handleClose();
    };

    const submitAction = () => {
        if (!selectedAction) return;
        const id = ticket.id;
        const payload = {
            status: { statusId: String(selectedAction.nextStatus) },
            assignedBy: getCurrentUserDetails()?.username,
            remark
        } as any;
        updateTicketApiHandler(() => updateTicket(id, payload)).then(() => {
            searchCurrentTicketsPaginatedApi(id);
        });
        cancelAction();
    };

    const cancelAction = () => {
        setShowRemark(false);
        setSelectedAction(null);
        setRemark('');
    };

    const getConfirmationText = (action: string) => {
        switch (action) {
            case 'Reopen':
                return 'If you are sure you want to Reopen the ticket, please add a remark and submit';
            case 'Resolve':
                return 'If you are sure you want to Resolve the ticket, please add a remark and submit';
            case 'Close':
                return 'If you are sure you want to Close the ticket, please add a remark and submit';
            default:
                return `If you are sure you want to ${action} the ticket, please add a remark and submit`;
        }
    };

    const recordActions = getAvailableActions(ticket.statusId);
    const statusName = getStatusNameById(ticket.statusId || '') || '';
    const statusColor = getStatusColorById(ticket.statusId || '') || undefined;
    const truncatedStatus = statusName.length > 12 ? `${statusName.slice(0, 12)}...` : statusName;

    return (
        <Card
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            sx={{ cursor: 'pointer', border: '1px solid', borderColor: 'grey.300', boxShadow: 'none', height: '100%', position: 'relative', transition: 'background-color 0.2s, transform 0.2s', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', transform: 'scale(1.02)' }, borderRadius: 2 }}
        >
            <CardContent sx={{ pb: 6 }}>
                <Typography color="text.secondary" sx={{ fontSize: '8px' }} title={ticket.id}>
                    {ticket.id}
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
                {allowAssigneeChange(ticket.statusId) ? (
                    <AssigneeDropdown ticketId={ticket.id} assigneeName={ticket.assignedTo} />
                ) : (
                    ticket.assignedTo ? (
                        <Tooltip title={ticket.assignedTo}>
                            <span><UserAvatar name={ticket.assignedTo} /></span>
                        </Tooltip>
                    ) : null
                )}
            </Box>
            {hover && (
                <Box sx={{ position: 'absolute', bottom: 4, right: 4, display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
                    <VisibilityIcon
                        onClick={(e) => { e.stopPropagation(); navigate(`/tickets/${ticket.id}`); }}
                        fontSize="small"
                        sx={{ color: 'grey.600', cursor: 'pointer' }}
                    />
                    {recordActions.length <= 2 ? (
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
                    <Tooltip title={statusName}>
                        <Chip
                            label={truncatedStatus}
                            size="small"
                            sx={{ fontSize: '8px', height: 18, cursor: 'default', bgcolor: statusColor, color: '#fff' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Tooltip>
                )}
                <Tooltip title={ticket.priority}>
                    <PriorityBar value={priorityMap[ticket.priority] || 0} />
                </Tooltip>
            </Box>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} onClick={(e)=>e.stopPropagation()}>
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
            {showRemark && selectedAction && (
                <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'grey.300', display: 'flex', flexDirection: 'column', gap: 1 }} onClick={(e)=>e.stopPropagation()}>
                    <Typography variant="body2">{getConfirmationText(selectedAction.action)}</Typography>
                    <TextField size="small" value={remark} onChange={(e) => setRemark(e.target.value)} />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button variant="contained" size="small" onClick={submitAction}>Submit</Button>
                        <Button variant="outlined" size="small" onClick={cancelAction}>Cancel</Button>
                    </Box>
                </Box>
            )}
        </Card>
    );
};

export default TicketCard;
