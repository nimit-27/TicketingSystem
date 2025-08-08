import React, { useEffect, useState } from 'react';
import { Menu, Box, TextField, Chip, List, ListItemButton, IconButton, Tooltip } from '@mui/material';
import { getAllLevels, getAllUsersByLevel } from '../../services/LevelService';
import { getAllUsers } from '../../services/UserService';
import { updateTicket } from '../../services/TicketService';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { useApi } from '../../hooks/useApi';
import { getCurrentUserDetails } from '../../config/config';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';

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

    // Use useApi for all API calls
    const { data: levelsData, apiHandler: getLevelsApiHandler } = useApi<any>();
    const { data: usersData, apiHandler: getUsersByLevelApiHandler } = useApi<any>();
    const { data: allUsersData, apiHandler: getAllUsersApiHandler } = useApi<any>();
    const { data: updateTicketData, apiHandler: updateTicketApiHandler, pending: updateTicketPending, success: updateTicketSuccess } = useApi<any>();

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

    // Call onAssigned and close menu when updateTicketData changes
    useEffect(() => {
        if (updateTicketSuccess) {
            // onAssigned?.(updateTicketData.user?.name);
            searchCurrentTicketsPaginatedApi && searchCurrentTicketsPaginatedApi(ticketId)
        }
    }, [updateTicketSuccess, onAssigned]);

    const handleSelect = (u: User) => {
        const payload = { assignedTo: u.username, assignedBy: getCurrentUserDetails()?.username } as any;
        updateTicketApiHandler(() => updateTicket(ticketId, payload));
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
                    <span><UserAvatar name={assigneeName} onClick={(e) => setAnchorEl(e.currentTarget)} /></span>
                </Tooltip>
            ) : (
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
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
            </Menu>
        </>
    );
};

export default AssigneeDropdown;
