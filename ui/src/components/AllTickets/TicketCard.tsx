import React from 'react';
import { Card, CardContent, Typography, Box, Tooltip } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MasterIcon from '../UI/Icons/MasterIcon';
import AssigneeDropdown from './AssigneeDropdown';

export interface TicketCardData {
    id: string;
    subject: string;
    category: string;
    subCategory: string;
    priority: string;
    isMaster: boolean;
    requestorName?: string;
    assignedTo?: string;
}

interface PriorityConfig { color: string; count: number; }

interface TicketCardProps {
    ticket: TicketCardData;
    priorityConfig: Record<string, PriorityConfig>;
    onClick?: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, priorityConfig, onClick }) => {
    const p = priorityConfig[ticket.priority as keyof typeof priorityConfig] || { color: 'grey.400', count: 1 };
    return (
        <Card onClick={onClick} sx={{ cursor: 'pointer', border: '2px solid', borderColor: (theme: any) => `${theme.palette[p.color.split('.')[0]]?.[p.color.split('.')[1]]}40`, boxShadow: 'none', height: '100%', position: 'relative', transition: 'background-color 0.2s, transform 0.2s', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', transform: 'scale(1.02)' } }}>
            <CardContent sx={{ pb: 4 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={ticket.subject}>{ticket.subject}</span>
                    {ticket.isMaster && <MasterIcon />}
                </Typography>
                <Typography variant="body2">Id: {ticket.id}</Typography>
                <Typography variant="body2">Requestor: {ticket.requestorName || '-'}</Typography>
                <Typography variant="body2">Category: {ticket.category}</Typography>
                <Typography variant="body2">Sub-Category: {ticket.subCategory}</Typography>
            </CardContent>
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                <AssigneeDropdown ticketId={ticket.id} assigneeName={ticket.assignedTo} />
            </Box>
            <Box sx={{ position: 'absolute', bottom: 4, right: 4, color: p.color }}>
                <Tooltip title={ticket.priority}>
                    <Box sx={{ position: 'relative', width: 24, height: 24 + (p.count - 1) * 10 }}>
                        {Array.from({ length: p.count }).map((_, i) => (
                            <KeyboardArrowUpIcon
                                key={i}
                                fontSize="small"
                                sx={{ position: 'absolute', left: 0, top: `${i * 10}px`, zIndex: p.count - i }}
                            />
                        ))}
                    </Box>
                </Tooltip>
            </Box>
        </Card>
    );
};

export default TicketCard;
