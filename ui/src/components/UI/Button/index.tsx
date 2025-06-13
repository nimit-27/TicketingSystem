import React, { ReactNode } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';

interface GenericButtonProps extends ButtonProps {
    textKey?: string;
    children?: ReactNode;
}

const GenericButton: React.FC<GenericButtonProps> = ({ textKey, children, ...props }) => (
    <Button
        {...props}
        sx={{
            backgroundColor: '#1b5e20',
            '&:hover': { backgroundColor: '#000000' },
            height: 50,
            fontFamily: 'Noto Sans',
            ...props.sx,
        }}
    >
        {textKey || children}
    </Button>
);

export default GenericButton;
