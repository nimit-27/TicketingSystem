import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { FciTheme } from '../../../config/config';
import { useTranslation } from 'react-i18next';

interface GenericInputProps extends Omit<TextFieldProps<'outlined'>, 'variant'> {
    label?: string;
    fullWidth?: boolean;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    variant?: 'outlined' | 'filled' | 'standard';
}

const GenericInput: React.FC<GenericInputProps> = ({
    label,
    fullWidth = false,
    required = false,
    disabled = false,
    className,
    style,
    ...props
}) => {
    const classes = `generic-input ${className ?? ''}`.trim();
    let size: "small" | "medium" = "medium";
    const { t } = useTranslation();

    return (
        <TextField
            label={label ? t(label) : undefined}
            fullWidth={fullWidth}
            required={required}
            disabled={disabled}
            className={classes}
            style={style}
            size={size}
            {...props}
        />
    );
};

export default GenericInput;
