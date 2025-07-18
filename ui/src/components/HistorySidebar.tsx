import React, { useState } from 'react';
import { Drawer, Tabs, Tab, Box, Button, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StatusHistory from './StatusHistory';
import AssignmentHistory from './AssignmentHistory';
import { useTranslation } from 'react-i18next';

interface HistorySidebarProps {
    ticketId: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ ticketId, open, setOpen }) => {
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
                <div style={{ position: 'fixed', right: -40, top: '40%', zIndex: 1300, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpen('status')}
                        sx={{ transform: 'rotate(-90deg)' }}
                    >
                        {t('Status History')}
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpen('assignment')}
                        sx={{ transform: 'rotate(-90deg)' }}
                    >
                        {t('Assignment History')}
                    </Button>
                </div>
            )}
            {open && (
                <IconButton onClick={handleClose} sx={{ position: 'fixed', right: 400, top: '50%', transform: 'translateY(-50%)', zIndex: 1300 }}>
                    <ChevronRightIcon />
                </IconButton>
            )}
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose}
                variant="persistent"
                PaperProps={{ sx: { top: '70px', height: 'calc(100vh - 70px)' } }}
            >
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
