import React, { useEffect, useState } from 'react';
import { Menu, Box, TextField, Chip, List, ListItemButton, ListItemText } from '@mui/material';
import { getAllLevels, getAllUsersByLevel } from '../../services/LevelService';
import { updateTicket } from '../../services/TicketService';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { useApi } from '../../hooks/useApi';
import { getCurrentUserDetails } from '../../config/config';

interface AssigneeDropdownProps {
    ticketId: string;
    assigneeName?: string;
    onAssigned?: (name: string) => void;
}

interface Level { levelId: string; levelName: string; }
interface User { userId: string; name: string; }

const AssigneeDropdown: React.FC<AssigneeDropdownProps> = ({ ticketId, assigneeName, onAssigned }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const [search, setSearch] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');

    // Use useApi for all API calls
    const { data: levelsData, apiHandler: getLevelsApiHandler } = useApi<any>();
    const { data: usersData, apiHandler: getUsersByLevelApiHandler } = useApi<any>();
    const { data: updateData, apiHandler: updateTicketApiHandler } = useApi<any>();

    // Fetch levels on mount
    useEffect(() => {
        getLevelsApiHandler(() => getAllLevels());
    }, []);

    // Fetch users when selectedLevel changes
    useEffect(() => {
        if (selectedLevel) {
            getUsersByLevelApiHandler(() => getAllUsersByLevel(selectedLevel));
        }
    }, [selectedLevel]);

    // Call onAssigned and close menu when updateData changes
    useEffect(() => {
        if (updateData && updateData.success && updateData.user) {
            onAssigned?.(updateData.user.name);
            setAnchorEl(null);
        }
    }, [updateData, onAssigned]);

    const handleSelect = (u: User) => {
        const payload = { assignedTo: u.userId, assignedBy: getCurrentUserDetails()?.userId } as any;
        updateTicketApiHandler(() => updateTicket(ticketId, payload));
    };

    const levels: Level[] = levelsData || [];
    const users: User[] = usersData || [];

    const filtered = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.userId.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <UserAvatar name={assigneeName || ''} onClick={(e) => setAnchorEl(e.currentTarget)} />
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                <Box sx={{ p: 1, width: 250 }}>
                    <TextField value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" size="small" fullWidth />
                    <Box sx={{ mt: 1, mb: 1, display: 'flex', flexWrap: 'wrap' }}>
                        {levels.map(l => (
                            <Chip
                                key={l.levelId}
                                label={l.levelName}
                                onClick={() => setSelectedLevel(l.levelId)}
                                color={selectedLevel === l.levelId ? 'primary' : 'default'}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                            />
                        ))}
                    </Box>
                    <List dense>
                        {filtered.map(u => (
                            <ListItemButton key={u.userId} onClick={() => handleSelect(u)}>
                                <ListItemText primary={`${levels.find(l=>l.levelId===selectedLevel)?.levelName || ''} - ${u.name}`} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Menu>
        </>
    );
};

export default AssigneeDropdown;
