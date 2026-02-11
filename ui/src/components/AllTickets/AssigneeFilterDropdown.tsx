import React, { useEffect, useMemo, useState } from 'react';
import { Box, Chip, IconButton, List, ListItemButton, Menu, TextField, Tooltip } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import UserAvatar from '../UI/UserAvatar/UserAvatar';
import { useApi } from '../../hooks/useApi';
import { getAllLevels, getAllUsersByLevel } from '../../services/LevelService';
import { getAllUsers } from '../../services/UserService';
import './AssigneeDropdown.scss';

interface Level {
    levelId: string;
    levelName: string;
}

interface User {
    userId: string;
    username: string;
    name: string;
    roles?: string;
    levels?: string[];
    levelId?: string;
}

interface AssigneeFilterDropdownProps {
    value: string;
    onChange: (value: string) => void;
}

const AssigneeFilterDropdown: React.FC<AssigneeFilterDropdownProps> = ({ value, onChange }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [search, setSearch] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const open = Boolean(anchorEl);

    const { data: levelsData, apiHandler: getLevelsApiHandler } = useApi<any>();
    const { data: usersData, apiHandler: getUsersByLevelApiHandler } = useApi<any>();
    const { data: allUsersData, apiHandler: getAllUsersApiHandler } = useApi<any>();

    useEffect(() => {
        getLevelsApiHandler(() => getAllLevels());
        getAllUsersApiHandler(() => getAllUsers());
    }, []);

    useEffect(() => {
        if (selectedLevel) {
            getUsersByLevelApiHandler(() => getAllUsersByLevel(selectedLevel));
        }
    }, [selectedLevel]);

    const levels: Level[] = levelsData || [];
    const baseUsers: User[] = selectedLevel ? (usersData || []) : (allUsersData || []);
    const expandedUsers: User[] = baseUsers.flatMap((u: User) => {
        const ids = u.levels && u.levels.length ? u.levels : [''];
        return ids.map(id => ({ ...u, levelId: id }));
    });

    const allowedRoleIds = ['3', '8'];
    const allowedUsers = expandedUsers.filter(u =>
        u.roles?.split('|').some((roleId: string) => allowedRoleIds.includes(roleId))
    );

    const filteredUsers = allowedUsers.filter(u => {
        const query = search.toLowerCase();
        return u.name?.toLowerCase().includes(query)
            || u.username?.toLowerCase().includes(query)
            || u.userId?.toLowerCase().includes(query);
    });

    const selectedLabel = useMemo(() => {
        if (!value || value === 'All') return '';
        const matched = allowedUsers.find(user => user.username === value || user.userId === value);
        return matched?.name || value;
    }, [allowedUsers, value]);

    const handleSelect = (user: User) => {
        onChange(user.username || user.userId);
        setAnchorEl(null);
    };

    return (
        <>
            <div className="col-3 px-1 d-flex align-items-end">
                {value && value !== 'All'
                    ? (
                        <Tooltip title={selectedLabel || value}>
                            <span>
                                <UserAvatar
                                    name={selectedLabel || value}
                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                    className="assignee-btn shadow"
                                />
                            </span>
                        </Tooltip>
                    )
                    : (
                        <IconButton
                            size="small"
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            className="assignee-btn shadow"
                        >
                            <PersonAddAltIcon fontSize="small" />
                        </IconButton>
                    )}
                <span className="ms-2 text-muted small">Assignee</span>
            </div>

            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
                <Box sx={{ p: 1, width: 350 }}>
                    <TextField
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search"
                        size="small"
                        fullWidth
                    />
                    <Box sx={{ mt: 1, mb: 1, display: 'flex', flexWrap: 'wrap' }}>
                        <Chip
                            label="All"
                            onClick={() => {
                                setSelectedLevel('');
                                onChange('All');
                                setAnchorEl(null);
                            }}
                            color={value === 'All' ? 'primary' : 'default'}
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                        />
                        {levels.map(level => (
                            <Chip
                                key={level.levelId}
                                label={level.levelId}
                                onClick={() => setSelectedLevel(prev => prev === level.levelId ? '' : level.levelId)}
                                color={selectedLevel === level.levelId ? 'primary' : 'default'}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                            />
                        ))}
                    </Box>

                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <List dense>
                            {filteredUsers.map(user => (
                                <ListItemButton key={`${user.userId}-${user.levelId || ''}`} onClick={() => handleSelect(user)}>
                                    <Box sx={{ display: 'flex', width: '100%' }}>
                                        <Box sx={{ width: 60 }}>{user.levelId}</Box>
                                        <Box sx={{ flexGrow: 1 }}>{user.name}</Box>
                                        <Box sx={{ width: 80, fontStyle: 'italic', color: 'text.secondary' }}>{user.username}</Box>
                                    </Box>
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                </Box>
            </Menu>
        </>
    );
};

export default AssigneeFilterDropdown;
