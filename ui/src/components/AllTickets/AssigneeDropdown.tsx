import React, { useEffect, useState } from 'react';
import { Menu, Box, TextField, Chip, List, ListItemButton, IconButton, Tooltip } from '@mui/material';
import { getAllLevels, getAllUsersByLevel } from '../../services/LevelService';
import { getAllUsers } from '../../services/UserService';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { useApi } from '../../hooks/useApi';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import './AssigneeDropdown.scss';
import ActionRemarkComponent from './ActionRemarkComponent';
import { updateTicket } from '../../services/TicketService';
import { getCurrentUserDetails } from '../../config/config';

interface AssigneeDropdownProps {
    ticketId: string;
    assigneeName?: string;
    onAssigned?: (name: string) => void;
    searchCurrentTicketsPaginatedApi?: (id: string) => void;
}

interface Level { levelId: string; levelName: string; }
interface User { userId: string; username: string; name: string; }

const AssigneeDropdown: React.FC<AssigneeDropdownProps> = ({ ticketId, assigneeName, onAssigned, searchCurrentTicketsPaginatedApi }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const [search, setSearch] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [userLevels, setUserLevels] = useState<Record<string, string>>({});
    const [showActionRemark, setShowActionRemark] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Use useApi for all API calls
    const { data: levelsData, apiHandler: getLevelsApiHandler } = useApi<any>();
    const { data: usersData, apiHandler: getUsersByLevelApiHandler } = useApi<any>();
    const { data: allUsersData, apiHandler: getAllUsersApiHandler } = useApi<any>();
    const { apiHandler: updateTicketApiHandler } = useApi<any>();

    // Fetch levels on mount
    useEffect(() => {
        getLevelsApiHandler(() => getAllLevels());
        getAllUsersApiHandler(() => getAllUsers());
    }, []);

    // Fetch users when selectedLevel changes
    useEffect(() => {
        if (selectedLevel) {
            getUsersByLevelApiHandler(() => getAllUsersByLevel(selectedLevel));
        }
    }, [selectedLevel]);


    const handleSelect = (u: User) => {
        setSelectedUser(u);
        setShowActionRemark(true);
    };

    const handleCancelRemark = () => {
        setShowActionRemark(false);
        setSelectedUser(null);
    };

    const handleSubmitRemark = (remark: string, selectedUser: User) => {
        const payload = {
            assignedTo: selectedUser.username,
            remark,
            assignedBy: getCurrentUserDetails()?.username,
            updatedBy: getCurrentUserDetails()?.username
        };
        updateTicketApiHandler(() => updateTicket(ticketId, payload)).then(() => {
            handleSuccess();
        });
    }

    const handleSuccess = () => {
        searchCurrentTicketsPaginatedApi && searchCurrentTicketsPaginatedApi(ticketId);
        onAssigned && selectedUser && onAssigned(selectedUser.name);
        handleCancelRemark();
        setAnchorEl(null);
    };

    const levels: Level[] = levelsData || [];
    const users: User[] = selectedLevel ? (usersData || []) : (allUsersData || []);

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase())
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
                    <TextField value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" size="small" fullWidth />
                    <Box sx={{ mt: 1, mb: 1, display: 'flex', flexWrap: 'wrap' }}>
                        {levels.map(l => (
                            <Chip
                                key={l.levelId}
                                label={l.levelName}
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
                                <ListItemButton key={u.userId} onClick={() => handleSelect(u)}>
                                    <Box sx={{ display: 'flex', width: '100%' }}>
                                        <Box sx={{ width: 60 }}>
                                            {selectedLevel ? levels.find(l => l.levelId === selectedLevel)?.levelName : userLevels[u.userId]}
                                        </Box>
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
                </Box>
            </Menu>
        </>
    );
};

export default AssigneeDropdown;
