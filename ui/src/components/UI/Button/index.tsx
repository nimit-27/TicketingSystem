import React, { ReactNode, forwardRef } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

export interface GenericButtonProps extends ButtonProps {
    textKey?: string;
    children?: ReactNode;
}

const toSxArray = (sx?: ButtonProps['sx']) => {
    if (Array.isArray(sx)) {
        return sx;
    }
    return sx ? [sx] : [];
};

const GenericButton = forwardRef<HTMLButtonElement, GenericButtonProps>(({ textKey, children, className, color = "success", sx, ...props }, ref) => {
    const { t } = useTranslation();
    return (
        <Button
            ref={ref}
            color={color}
            className={className}
            sx={[{ textTransform: 'uppercase' }, ...toSxArray(sx)]}
            {...props}
        >
            {textKey ? t(textKey) : children}
        </Button>
    );
});

GenericButton.displayName = 'GenericButton';

export default GenericButton;
