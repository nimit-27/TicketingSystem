import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

interface GenericInputProps extends Omit<TextFieldProps<"outlined">, "variant"> {
    label?: string;
    fullWidth?: boolean;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    variant?: "outlined" | "filled" | "standard";
}

const GenericInput: React.FC<GenericInputProps> = ({
    label,
    fullWidth = false,
    required = false,
    disabled = false,
    className = 'form-control',
    style,
    ...props
}) => {
    return (
        <>
            {/* {label && (
                <label style={{ display: 'block', marginBottom: 4 }}>
                    {label}
                    {required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
                </label>
            )} */}
            <TextField
                label={label}
                fullWidth={fullWidth}
                required={required}
                disabled={disabled}
                className={className}
                style={style}
                size='small'
                {...props}
            />
        </>
    );
};

export default GenericInput;
