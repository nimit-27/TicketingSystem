import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface RequestorDetailsProps {
    email?: string;
    phone?: string;
}

const RequestorDetails: React.FC<RequestorDetailsProps> = ({ email, phone }) => {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (type: 'email' | 'phone', value?: string) => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const renderRow = (label: string, value: string | undefined, type: 'email' | 'phone') => (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <ContentCopyIcon
                fontSize="small"
                sx={{ mr: 0.5, cursor: value ? 'pointer' : 'not-allowed' }}
                onClick={() => handleCopy(type, value)}
            />
            <Typography variant="body2">{value || '-'}</Typography>
            {copied === type && (
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                    {label} copied
                </Typography>
            )}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {renderRow('Email', email, 'email')}
            {renderRow('Phone number', phone, 'phone')}
        </Box>
    );
};

export default RequestorDetails;
