import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

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
    return (
        <TextField
            label={label}
            fullWidth={fullWidth}
            required={required}
            disabled={disabled}
            className={classes}
            style={style}
            size='small'
            {...props}
        />
    );
};

export default GenericInput;
