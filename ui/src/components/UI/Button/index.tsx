import React, { ReactNode } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';

interface GenericButtonProps extends ButtonProps {
    textKey?: string;
    children?: ReactNode;
}

const GenericButton: React.FC<GenericButtonProps> = ({
    textKey,
    children,
    className,
    color = "success",
    ...props
}) => (
    <Button
        // className={`generic-button ${className ?? ''}`.trim()}
        color={color}
        {...props}
    >
        {textKey || children}
    </Button>
);

export default GenericButton;
