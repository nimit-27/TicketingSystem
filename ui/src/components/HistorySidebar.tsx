import React, { useState } from 'react';
import { Drawer, Tabs, Tab, Box, Button, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import StatusHistory from './StatusHistory';
import AssignmentHistory from './AssignmentHistory';
import { useTranslation } from 'react-i18next';

interface HistorySidebarProps {
    ticketId: number;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ ticketId }) => {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<'status' | 'assignment'>('status');
    const { t } = useTranslation();

    const handleOpen = (value: 'status' | 'assignment') => {
        setTab(value);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    return (
        <>
            {!open && (
                <div style={{ position: 'fixed', right: 0, top: '40%', zIndex: 1300, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button variant="contained" size="small" onClick={() => handleOpen('status')}>{t('Status History')}</Button>
                    <Button variant="contained" size="small" onClick={() => handleOpen('assignment')}>{t('Assignment History')}</Button>
                </div>
            )}
            <Drawer anchor="right" open={open} onClose={handleClose}>
                <Box sx={{ width: 400, position: 'relative', p: 2 }}>
                    <IconButton onClick={handleClose} sx={{ position: 'absolute', left: -40, top: 8 }}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                        <Tab label={t('Status History')} value="status" />
                        <Tab label={t('Assignment History')} value="assignment" />
                    </Tabs>
                    <Box sx={{ mt: 2 }}>
                        {tab === 'status' ? (
                            <StatusHistory ticketId={ticketId} />
                        ) : (
                            <AssignmentHistory ticketId={ticketId} />
                        )}
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default HistorySidebar;
