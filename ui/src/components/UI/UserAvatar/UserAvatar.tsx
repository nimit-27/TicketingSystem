import React from 'react';
import Avatar from '@mui/material/Avatar';

interface UserAvatarProps {
    name: string;
    onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    size?: number;
    className?: string;
}

const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    const initials = parts.map(p => p[0]).slice(0,2).join('');
    return initials.toUpperCase();
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name, onClick, size = 32, className }) => (
    <Avatar
        onClick={onClick}
        className={className}
        sx={{ width: size, height: size, bgcolor: name ? 'primary.main' : '', cursor: onClick ? 'pointer' : 'default' }}
    >
        {getInitials(name)}
    </Avatar>
);

export default UserAvatar;
