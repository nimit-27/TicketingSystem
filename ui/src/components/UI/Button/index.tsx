import React, { ReactNode } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';

interface GenericButtonProps extends ButtonProps {
    textKey?: string;
    children?: ReactNode;
}

const GenericButton: React.FC<GenericButtonProps> = ({ textKey, children, className, ...props }) => (
    <Button {...props} className={`generic-button ${className ?? ''}`.trim()}>
        {textKey || children}
    </Button>
);

export default GenericButton;
