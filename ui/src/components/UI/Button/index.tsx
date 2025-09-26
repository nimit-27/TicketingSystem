import React, { ReactNode, forwardRef } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

interface GenericButtonProps extends ButtonProps {
    textKey?: string;
    children?: ReactNode;
}

const GenericButton = forwardRef<HTMLButtonElement, GenericButtonProps>(({ textKey, children, className, color = "success", ...props }, ref) => {
    const { t } = useTranslation();
    return (
        <Button ref={ref} color={color} className={className} {...props}>
            {textKey ? t(textKey) : children}
        </Button>
    );
});

GenericButton.displayName = 'GenericButton';

export default GenericButton;
