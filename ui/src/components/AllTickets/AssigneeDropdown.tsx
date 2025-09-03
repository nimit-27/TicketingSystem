import React, { useEffect, useState } from 'react';
import { Menu, Box, TextField, Chip, List, ListItemButton, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, Tabs, Tab } from '@mui/material';
import { getAllLevels, getAllUsersByLevel } from '../../services/LevelService';
import { getAllUsers, getUsersByRoles } from '../../services/UserService';
import { getAllRoles } from '../../services/RoleService';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { useApi } from '../../hooks/useApi';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import './AssigneeDropdown.scss';
import ActionRemarkComponent from './ActionRemarkComponent';
import { updateTicket } from '../../services/TicketService';
import { getCurrentUserDetails } from '../../config/config';
import AdvancedAssignmentOptionsDialog from './AdvancedAssignmentOptionsDialog';

interface AssigneeDropdownProps {
    ticketId: string;
    assigneeName?: string;
    onAssigned?: (name: string) => void;
    searchCurrentTicketsPaginatedApi?: (id: string) => void;
    requestorId?: string;
}

interface Level { levelId: string; levelName: string; }
interface User { userId: string; username: string; name: string; roles?: string; levels?: string[]; levelId?: string; levelName?: string; }

const AssigneeDropdown: React.FC<AssigneeDropdownProps> = ({ ticketId, assigneeName, onAssigned, searchCurrentTicketsPaginatedApi, requestorId }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const [search, setSearch] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [showActionRemark, setShowActionRemark] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [tab, setTab] = useState<'user' | 'requester' | 'rno'>('user');
    const [rnoSearch, setRnoSearch] = useState('');

    // Use useApi for all API calls
    const { data: levelsData, apiHandler: getLevelsApiHandler } = useApi<any>();
    const { data: usersData, apiHandler: getUsersByLevelApiHandler } = useApi<any>();
    const { data: allUsersData, apiHandler: getAllUsersApiHandler } = useApi<any>();
    const { data: rolesData, apiHandler: getRolesApiHandler } = useApi<any>();
    const { data: rnoData, apiHandler: getRnoUsersApiHandler } = useApi<any>();
    const { apiHandler: updateTicketApiHandler } = useApi<any>();

    const allowedActions = getCurrentUserDetails()?.allowedStatusActionIds || [];
    const canRequester = allowedActions.includes('4');
    const canRno = allowedActions.includes('16');
    const REQUESTER_STATUS_ID = '3';
    const FCI_STATUS_ID = '5';

    // Fetch levels, users and roles on mount
    useEffect(() => {
        getLevelsApiHandler(() => getAllLevels());
        getAllUsersApiHandler(() => getAllUsers());
        getRolesApiHandler(() => getAllRoles());
    }, []);

    // Fetch users when selectedLevel changes
    useEffect(() => {
        if (selectedLevel) {
            getUsersByLevelApiHandler(() => getAllUsersByLevel(selectedLevel));
        }
    }, [selectedLevel]);

    useEffect(() => {
        if (advancedOpen && tab === 'rno' && rolesData) {
            const rnoRole = (rolesData as any[]).find(r => r.role === 'RegionalNodalOfficer');
            if (rnoRole) {
                getRnoUsersApiHandler(() => getUsersByRoles([String(rnoRole.roleId)]));
            }
        }
    }, [advancedOpen, tab, rolesData]);


    const handleSelect = (u: User) => {
        setSelectedUser(u);
        setShowActionRemark(true);
    };

    const handleCancelRemark = () => {
        setShowActionRemark(false);
        setSelectedUser(null);
    };

    const handleSubmitRemark = (remark: string, selectedUser: User) => {
        let payload: any = {
            assignedTo: selectedUser.username,
            remark,
            assignedBy: getCurrentUserDetails()?.username,
            updatedBy: getCurrentUserDetails()?.username
        };
        if (tab === 'user') {
            payload.assignedToLevel = selectedUser.levelId;
            payload.levelId = selectedUser.levelId;
        }
        if (tab === 'rno') {
            payload.status = { statusId: FCI_STATUS_ID };
        }
        updateTicketApiHandler(() => updateTicket(ticketId, payload)).then(() => {
            handleSuccess(selectedUser.name);
        });
    };

    const handleAssignRequester = (remark: string) => {
        const payload = {
            assignedTo: requestorId,
            status: { statusId: REQUESTER_STATUS_ID },
            remark,
            assignedBy: getCurrentUserDetails()?.username,
            updatedBy: getCurrentUserDetails()?.username
        };
        updateTicketApiHandler(() => updateTicket(ticketId, payload)).then(() => {
            handleSuccess();
        });
    };

    const handleSuccess = (name?: string) => {
        searchCurrentTicketsPaginatedApi && searchCurrentTicketsPaginatedApi(ticketId);
        if (onAssigned && name) onAssigned(name);
        handleCancelRemark();
        setAnchorEl(null);
        setAdvancedOpen(false);
    };

    const levels: Level[] = levelsData || [];
    const baseUsers: User[] = selectedLevel ? (usersData || []) : (allUsersData || []);
    const expandedUsers: User[] = baseUsers.flatMap(u => {
        const ids = u.levels && u.levels.length ? u.levels : [''];
        return ids.map(id => ({ ...u, levelId: id }));
    });
    const allowedRoleIds = ['3', '8'];
    const allowedUsers = expandedUsers.filter(u =>
        u.roles?.split('|').some(r => allowedRoleIds.includes(r))
    );

    const filtered = allowedUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
    );

    const rnoUsers: User[] = rnoData || [];
    const rnoFiltered = rnoUsers.filter(u =>
        u.name.toLowerCase().includes(rnoSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(rnoSearch.toLowerCase())
    );

    const renderAssignForm = () => (
        <>
            <TextField value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" size="small" fullWidth />
            <Box sx={{ mt: 1, mb: 1, display: 'flex', flexWrap: 'wrap' }}>
                {levels.map(l => (
                    <Chip
                        key={l.levelId}
                        label={l.levelId}
                        onClick={() => setSelectedLevel(prev => prev === l.levelId ? '' : l.levelId)}
                        color={selectedLevel === l.levelId ? 'primary' : 'default'}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                    />
                ))}
            </Box>
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                <List dense>
                    {filtered.map(u => (
                        <ListItemButton key={`${u.userId}-${u.levelId}`} onClick={() => handleSelect(u)}>
                            <Box sx={{ display: 'flex', width: '100%' }}>
                                <Box sx={{ width: 60 }}>{u.levelId}</Box>
                                <Box sx={{ flexGrow: 1 }}>{u.name}</Box>
                                <Box sx={{ width: 80, fontStyle: 'italic', color: 'text.secondary' }}>{u.username}</Box>
                            </Box>
                        </ListItemButton>
                    ))}
                </List>
            </Box>
            {showActionRemark && selectedUser && (
                <Box sx={{ mt: 1 }}>
                    <ActionRemarkComponent
                        actionName="Assign"
                        onCancel={handleCancelRemark}
                        onSubmit={(remark) => handleSubmitRemark(remark, selectedUser)}
                    />
                </Box>
            )}
        </>
    );

    return (
        <>
            {assigneeName ? (
                <Tooltip title={assigneeName}>
                    <span>
                        <UserAvatar
                            name={assigneeName}
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            className="assignee-btn shadow"
                        />
                    </span>
                </Tooltip>
            ) : (
                <IconButton
                    size="small"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    className="assignee-btn shadow"
                >
                    <PersonAddAltIcon fontSize="small" />
                </IconButton>
            )}
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                <Box sx={{ p: 1, width: 350 }}>
                    {renderAssignForm()}
                    <Box sx={{ mt: 1, textAlign: 'right' }}>
                        <Button size="small" onClick={() => { setAdvancedOpen(true); setTab('user'); setAnchorEl(null); }}>Advanced Options</Button>
                    </Box>
                </Box>
            </Menu>
            <AdvancedAssignmentOptionsDialog
                open={advancedOpen}
                onClose={() => setAdvancedOpen(false)}
                ticketId={ticketId}
                requestorId={requestorId}
                canRequester={canRequester}
                canRno={canRno}
                levels={levels}
                users={baseUsers}
                rnoUsers={rnoUsers}
                updateTicketApiHandler={updateTicketApiHandler}
                searchCurrentTicketsPaginatedApi={searchCurrentTicketsPaginatedApi}
                onAssigned={onAssigned}
            />
        </>
    );
};

export default AssigneeDropdown;
