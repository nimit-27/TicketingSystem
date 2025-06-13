import { InputLabel, TextField, TextFieldProps } from "@mui/material";
import { FormProps } from "../../../types";

interface CustomFormInputProps extends Omit<TextFieldProps<'outlined'>, 'variant'>, Omit<FormProps, 'control'> {
    name: string;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    fullWidth?: boolean;
    showLabel?: boolean;
    validations?: any;
    [key: string]: any;
}

const CustomFormInput: React.FC<CustomFormInputProps> = ({
    register,
    errors,
    name,
    label,
    required = false,
    disabled = false,
    className,
    style,
    fullWidth = true,
    showLabel = false,
    validations = {},
    ...inputProps
}) => {
    const hasError = !!(errors && errors[name]);
    const errorMessage = (errors && errors[name]?.message) as string;
    validations = { ...validations, required: required ? `Please fill the ${label}` : false };

    const classes = `generic-input ${className ?? ''}`.trim();

    return (
        <>
            {showLabel && (
                <InputLabel style={{ display: 'block', marginBottom: 4 }}>
                    {label}
                    {required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
                </InputLabel>
            )}
            <TextField
                label={label}
                fullWidth={fullWidth}
                disabled={disabled}
                className={classes}
                style={style}
                size="small"
                error={hasError}
                helperText={hasError ? errorMessage : ""}
                {...register(name, validations)}
                {...inputProps}
            />
        </>
    );
};

export default CustomFormInput;
