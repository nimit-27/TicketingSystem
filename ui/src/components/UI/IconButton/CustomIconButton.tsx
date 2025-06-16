import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';

// Define the icon map
const iconMap = {
    delete: DeleteIcon,
    edit: EditIcon,
    send: SendIcon,
    grid: ViewModuleIcon,
    table: TableRowsIcon
};

// Valid keys for the icon map
type IconKey = keyof typeof iconMap;

interface CustomIconButtonProps extends IconButtonProps {
    icon: string; // passed in as string, handled internally
}

// Helper component to render icon
export const IconComponent: React.FC<{ icon: string; fontSize?: 'small' | 'medium' | 'large' }> = ({
    icon,
    fontSize = 'small',
}) => {
    const key = icon as IconKey;
    const Icon = iconMap[key];

    return Icon ? <Icon fontSize={fontSize} /> : null;
};

const CustomIconButton: React.FC<CustomIconButtonProps> = ({ icon, ...props }) => {
    return (
        <IconButton {...props}>
            <IconComponent icon={icon} />
        </IconButton>
    );
};

export default CustomIconButton;
