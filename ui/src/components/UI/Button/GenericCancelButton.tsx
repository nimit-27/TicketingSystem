import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import GenericButton, { GenericButtonProps } from '.';

type GenericCancelButtonProps = GenericButtonProps;

const toSxArray = (sx?: GenericButtonProps['sx']) => {
    if (Array.isArray(sx)) {
        return sx;
    }
    return sx ? [sx] : [];
};

const GenericCancelButton = forwardRef<HTMLButtonElement, GenericCancelButtonProps>(({ textKey, children, sx, variant, type, ...props }, ref) => {
    const theme = useTheme();
    const { cancel } = theme.palette.global.buttons;
    const resolvedTextKey = children ? undefined : (textKey ?? 'global.buttons.cancel');

    const styles = {
        backgroundColor: cancel.background,
        color: cancel.color,
        borderColor: cancel.border,
        '&:hover': {
            backgroundColor: cancel.hoverBackground,
            color: cancel.hoverColor,
            borderColor: cancel.hoverBorder,
        },
        '&.Mui-disabled': {
            backgroundColor: '#d4d4d4',
            borderColor: '#d4d4d4',
            color: theme.palette.text.disabled,
        },
    };

    return (
        <GenericButton
            ref={ref}
            textKey={resolvedTextKey}
            size="large"
            variant={variant ?? 'outlined'}
            type={type ?? 'button'}
            sx={[styles, ...toSxArray(sx)]}
            {...props}
        >
            {children}
        </GenericButton>
    );
});

GenericCancelButton.displayName = 'GenericCancelButton';

export default GenericCancelButton;
