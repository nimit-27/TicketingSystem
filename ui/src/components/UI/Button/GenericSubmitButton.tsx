import React, { forwardRef } from 'react';
import { useTheme } from '@mui/material/styles';
import GenericButton, { GenericButtonProps } from '.';

type GenericSubmitButtonProps = GenericButtonProps;

const toSxArray = (sx?: GenericButtonProps['sx']) => {
    if (Array.isArray(sx)) {
        return sx;
    }
    return sx ? [sx] : [];
};

const GenericSubmitButton = forwardRef<HTMLButtonElement, GenericSubmitButtonProps>(({ textKey, children, sx, size="large", variant, type, ...props }, ref) => {
    const theme = useTheme();
    const { save } = theme.palette.global.buttons;
    const resolvedTextKey = children ? undefined : (textKey ?? 'global.buttons.save');

    const styles = {
        backgroundColor: save.background,
        color: save.color,
        borderColor: save.border,
        '&:hover': {
            backgroundColor: save.hoverBackground,
            color: save.hoverColor,
            borderColor: save.hoverBorder,
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
            size={size}
            variant={variant ?? 'contained'}
            type={type ?? 'submit'}
            sx={[styles, ...toSxArray(sx)]}
            {...props}
        >
            {children}
        </GenericButton>
    );
});

GenericSubmitButton.displayName = 'GenericSubmitButton';

export default GenericSubmitButton;
