import React from 'react';
import { Box, Typography } from '@mui/material';
import UserAvatar from './UI/UserAvatar/UserAvatar';

type CopyField = 'name' | 'username' | 'email' | 'phone';

interface UserDetailsCardProps {
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    showName?: boolean;
    showUsername?: boolean;
    showEmail?: boolean;
    showPhone?: boolean;
    copiedField?: CopyField | null;
    onCopy?: (field: CopyField, value: string) => void;
    details?: Array<{ label: string; value?: string | null }>;
}

const UserDetailsCard: React.FC<UserDetailsCardProps> = ({
    name,
    username,
    email,
    phone,
    showName = true,
    showUsername = true,
    showEmail = true,
    showPhone = true,
    copiedField = null,
    onCopy,
    details = [],
}) => {
    const canCopy = Boolean(onCopy);

    const handleCopy = (field: CopyField, value?: string) => {
        if (!value || !onCopy) return;
        onCopy(field, value);
    };

    const renderCopyMessage = (field: CopyField, label: string) => (
        copiedField === field ? (
            <Typography variant="caption" color="success.main">
                {label} copied
            </Typography>
        ) : null
    );

    const normalizedDetails = details.filter(item => Boolean(item.value));

    return (
        <Box className="p-3 bg-light border rounded shadow-sm">
            <Box className="d-flex align-items-center justify-content-center mb-2">
                <UserAvatar name={name || username || ''} />
            </Box>
            <Box className="d-flex flex-column align-items-center mb-2 justify-content-center">
                {showName && name && (
                    <Typography
                        className="fw-semibold"
                        sx={{ cursor: canCopy ? 'pointer' : 'default' }}
                        onClick={() => handleCopy('name', name)}
                    >
                        {name}
                    </Typography>
                )}
                {renderCopyMessage('name', 'Name')}
                {showUsername && username && (
                    <Typography
                        className="text-muted ts-13"
                        sx={{ cursor: canCopy ? 'pointer' : 'default' }}
                        onClick={() => handleCopy('username', username)}
                    >
                        {username}
                    </Typography>
                )}
                {renderCopyMessage('username', 'Username')}
                {(showEmail && email) || (showPhone && phone) ? (
                    <Typography className="text-muted">
                        {showEmail && email && (
                            <span
                                className="ts-14"
                                style={{ cursor: canCopy ? 'pointer' : 'default' }}
                                onClick={() => handleCopy('email', email)}
                            >
                                {email}
                            </span>
                        )}
                        {showEmail && email && showPhone && phone && <span> | </span>}
                        {showPhone && phone && (
                            <span
                                className="ts-13"
                                style={{ cursor: canCopy ? 'pointer' : 'default' }}
                                onClick={() => handleCopy('phone', phone)}
                            >
                                {phone}
                            </span>
                        )}
                    </Typography>
                ) : null}
                {renderCopyMessage('email', 'Email')}
                {renderCopyMessage('phone', 'Contact')}
            </Box>
            {normalizedDetails.length > 0 && (
                <Box className="w-100">
                    {normalizedDetails.map(detail => (
                        <Box
                            key={detail.label}
                            className="d-flex justify-content-center text-center flex-column flex-md-row"
                        >
                            <Typography className="mb-0 text-muted ts-13">{detail.label}</Typography>
                            <Typography className="mb-0 ts-13 ms-md-2">{detail.value}</Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default UserDetailsCard;
