import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';

interface CustomIconButtonProps extends IconButtonProps {
    icon: React.ReactNode;
    label: string;
    selected?: boolean;
}

const CustomIconButton: React.FC<CustomIconButtonProps> = ({ icon, label, selected = false, ...props }) => (
    <div className="text-center">
        <IconButton color={selected ? 'primary' : 'default'} {...props}>
            {icon}
        </IconButton>
        <div className="small">{label}</div>
    </div>
);

export default CustomIconButton;
