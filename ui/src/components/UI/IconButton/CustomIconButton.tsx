import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';

const iconMap = {
    delete: DeleteIcon,
    edit: EditIcon,
    send: SendIcon
};

type IconKey = keyof typeof iconMap;

interface CustomIconButtonProps extends IconButtonProps {
    icon: string; // Allows any string, lowercase handled internally
}

const CustomIconButton: React.FC<CustomIconButtonProps> = ({ icon, ...props }) => {
    const key = icon.toLowerCase() as IconKey;
    const IconComponent = iconMap[key];

    return (
        <IconButton {...props}>
            {IconComponent && <IconComponent fontSize="small" />}
        </IconButton>
    );
};

export default CustomIconButton;
