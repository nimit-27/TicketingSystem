import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Box } from '@mui/material';
import RemarkComponent from '../UI/Remark/RemarkComponent';
import { getCurrentUserDetails } from '../../config/config';
import { updateTicket } from '../../services/TicketService';
import CustomTabsComponent, { TabItem } from '../UI/CustomTabsComponent';
import { TicketStatusWorkflow } from '../../types';

interface User {
    userId: string;
    username: string;
    name: string;
    roles?: string;
    levels?: string[];
    levelId?: string;
    levelName?: string;
}

interface Level { levelId: string; levelName: string; }

interface AdvancedAssignmentOptionsDialogProps {
    open: boolean;
    onClose: () => void;
    ticketId: string;
    requestorId?: string;
    canRequester: boolean;
    canAssignToFci: boolean;
    levels: Level[];
    users: User[];
    updateTicketApiHandler: any;
    searchCurrentTicketsPaginatedApi?: (id: string) => void;
    onAssigned?: (name: string) => void;
    getAllAvailableActionsByCurrentStatus?: (statusId: string) => TicketStatusWorkflow[]
}

const REQUESTER_STATUS_ID = '3';
const FCI_STATUS_ID = '5';

// --- AssignUserTab Component ---
const AssignUserTab: React.FC<{
    levels: Level[];
    users: User[];
    selectedLevel: string;
    setSelectedLevel: (val: string) => void;
    search: string;
    setSearch: (val: string) => void;
    showActionRemark: boolean;
    selectedUser: User | null;
    handleSelect: (u: User) => void;
    handleCancelRemark: () => void;
    handleSubmitRemark: (remark: string, selectedUser: User) => void;
}> = ({
    levels,
    users,
    selectedLevel,
    setSelectedLevel,
    search,
    setSearch,
    showActionRemark,
    selectedUser,
    handleSelect,
    handleCancelRemark,
    handleSubmitRemark,
}) => {
        const allowedRoleIds = ['3', '8'];
        const expandedUsers: User[] = React.useMemo(() => {
            const baseUsers = selectedLevel
                ? users.filter(u => (u.levels || []).includes(selectedLevel))
                : users;
            return baseUsers.flatMap(u => {
                const ids = u.levels && u.levels.length ? u.levels : [''];
                return ids.map(id => ({ ...u, levelId: id }));
            });
        }, [users, selectedLevel]);

        const allowedUsers = expandedUsers.filter(u =>
            u.roles?.split('|').some(r => allowedRoleIds.includes(r))
        );

        const filtered = allowedUsers.filter(u =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.username.toLowerCase().includes(search.toLowerCase())
        );

        return (
            <>
                <Box>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search"
                        className="form-control mb-2"
                    />
                    <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap' }}>
                        {levels.map(l => (
                            <span
                                key={l.levelId}
                                className={`badge me-1 mb-1 ${selectedLevel === l.levelId ? 'bg-primary' : 'bg-light text-dark'}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedLevel(selectedLevel === l.levelId ? '' : l.levelId)}
                            >
                                {l.levelId}
                            </span>
                        ))}
                    </Box>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <ul className="list-group">
                            {filtered.map(u => (
                                <li
                                    key={`${u.userId}-${u.levelId}`}
                                    className="list-group-item list-group-item-action"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleSelect(u)}
                                >
                                    <div className="d-flex">
                                        <div style={{ width: 60 }}>{u.levelId}</div>
                                        <div className="flex-grow-1">{u.name}</div>
                                        <div style={{ width: 80, fontStyle: 'italic', color: '#888' }}>{u.username}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Box>
                    {showActionRemark && selectedUser && (
                        <Box sx={{ mt: 1 }}>
                            <RemarkComponent
                                actionName="Assign"
                                onCancel={handleCancelRemark}
                                onSubmit={(remark) => handleSubmitRemark(remark, selectedUser)}
                            />
                        </Box>
                    )}
                </Box>
            </>
        );
    };

// --- RequesterTab Component ---
const RequesterTab: React.FC<{
    onCancel: () => void;
    onSubmit: (remark: string) => void;
}> = ({ onCancel, onSubmit }) => (
    <Box sx={{ mt: 1 }}>
        <RemarkComponent
            actionName="Assign to Requester"
            onCancel={onCancel}
            onSubmit={onSubmit}
        />
    </Box>
);

// --- AssignToFciTab Component ---
const AssignToFciTab: React.FC<{
    onCancel: () => void;
    onSubmit: (remark: string) => void;
}> = ({ onCancel, onSubmit }) => (
    <Box sx={{ mt: 1 }}>
        <RemarkComponent
            actionName="Assign to FCI"
            onCancel={onCancel}
            onSubmit={onSubmit}
        />
    </Box>
);

const AdvancedAssignmentOptionsDialog: React.FC<AdvancedAssignmentOptionsDialogProps> = ({
    open,
    onClose,
    ticketId,
    requestorId,
    canRequester,
    canAssignToFci,
    levels,
    users,
    updateTicketApiHandler,
    searchCurrentTicketsPaginatedApi,
    onAssigned,
}) => {
    const [tab, setTab] = useState<'user' | 'requester' | 'fci'>('user');
    const [selectedLevel, setSelectedLevel] = useState<string>('');
    const [search, setSearch] = useState('');
    const [showActionRemark, setShowActionRemark] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

    const handleAssignToFci = (remark: string) => {
        const payload = {
            status: { statusId: FCI_STATUS_ID },
            remark,
            assignedBy: getCurrentUserDetails()?.username,
            updatedBy: getCurrentUserDetails()?.username,
        };

        updateTicketApiHandler(() => updateTicket(ticketId, payload)).then(() => {
            handleSuccess();
        });
    };

    const handleSuccess = (name?: string) => {
        searchCurrentTicketsPaginatedApi && searchCurrentTicketsPaginatedApi(ticketId);
        if (onAssigned && name) onAssigned(name);
        handleCancelRemark();
        onClose();
    };

    // Tabs array for CustomTabsComponent
    const tabs: TabItem[] = [
        {
            key: 'user',
            tabTitle: 'Assign User',
            tabComponent: (
                <AssignUserTab
                    levels={levels}
                    users={users}
                    selectedLevel={selectedLevel}
                    setSelectedLevel={setSelectedLevel}
                    search={search}
                    setSearch={setSearch}
                    showActionRemark={showActionRemark}
                    selectedUser={selectedUser}
                    handleSelect={handleSelect}
                    handleCancelRemark={handleCancelRemark}
                    handleSubmitRemark={handleSubmitRemark}
                />
            ),
        },
        ...(canRequester
            ? [
                {
                    key: 'requester',
                    tabTitle: 'Requester',
                    tabComponent: (
                        <RequesterTab
                            onCancel={onClose}
                            onSubmit={handleAssignRequester}
                        />
                    ),
                },
            ]
            : []),
        ...(canAssignToFci
            ? [
                {
                    key: 'fci',
                    tabTitle: 'Assign to FCI',
                    tabComponent: (
                        <AssignToFciTab
                            onCancel={onClose}
                            onSubmit={handleAssignToFci}
                        />
                    ),
                },
            ]
            : []),
    ];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Advanced Options</DialogTitle>
            <DialogContent>
                <CustomTabsComponent
                    tabs={tabs}
                    currentTab={tab}
                    onTabChange={setTab as (key: string) => void}
                />
            </DialogContent>
        </Dialog>
    );
};

export default AdvancedAssignmentOptionsDialog;