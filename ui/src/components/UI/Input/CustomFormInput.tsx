import { InputLabel, TextField, TextFieldProps, useTheme } from "@mui/material";
import { FormProps } from "../../../types";
import { FciTheme } from "../../../config/config";
import { useTranslation } from "react-i18next";

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
    const theme = useTheme()
    const { t } = useTranslation();
    const hasError = !!(errors && errors[name]);
    const errorMessage = (errors && errors[name]?.message) as string;
    if (!disabled) {
        validations = { ...validations, required: required ? `Please fill the ${label}` : false };
    } else {
        validations = {};
    }

    const classes = `generic-input ${className ?? ''}`.trim();
    // let size: "small" | "medium" = !FciTheme ? "small" : "medium";
    let size: "small" | "medium" = "small";


    return (
        <>
            {showLabel && (
                <InputLabel style={{ display: 'block', marginBottom: 4 }}>
                    {label ? t(label) : ''}
                    {required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
                </InputLabel>
            )}
            <TextField
                sx={{
                    backgroundColor: disabled
                        ? theme.palette.action.disabledBackground
                        : theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    '& fieldset': {
                        borderColor: theme.palette.divider,
                    },
                }}
                label={label ? t(label) : undefined}
                fullWidth={fullWidth}
                disabled={disabled}
                className={classes}
                style={style}
                size={size}
                error={hasError}
                helperText={hasError ? errorMessage : ""}
                {...register(name, validations)}
                {...inputProps}
            />
        </>
    );
};

export default CustomFormInput;
