import React from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { FciTheme } from '../../../config/config';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

export interface DropdownOption {
    label: string;
    value: string;
}

export interface GenericDropdownProps {
    label?: string;
    value?: string;
    onChange: (event: SelectChangeEvent) => void;
    onBlur?: () => void;
    options?: DropdownOption[];
    fullWidth?: boolean;
    disabled?: boolean;
    name?: string;
    id?: string;
    required?: boolean;
    className?: string;
    menuItemsList?: any;
    style?: React.CSSProperties;
    error?: boolean;
    helperText?: string;
    [key: string]: any;
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({
    label,
    value,
    onChange,
    onBlur,
    options,
    fullWidth = false,
    disabled = false,
    name,
    id,
    required = false,
    menuItemsList,
    className,
    style,
    error = false,
    helperText,
    ...rest
}) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const classes = `generic-dropdown ${className ?? ''}`.trim();
    // let size: "small" | "medium" = !FciTheme ? "small" : "medium";
    let size: "small" | "medium" = "medium";
    const helperTextId = helperText ? `${id ?? name ?? 'generic-dropdown'}-helper-text` : undefined;
    const { ref, ...restProps } = rest;
    return (
        <FormControl
            fullWidth={fullWidth}
            disabled={disabled}
            required={required}
            style={style}
            className={classes}
            size={size}
            error={error}
        >
            {label && <InputLabel id={id ? `${id}-label` : undefined}>{t(label)}</InputLabel>}
            <Select
                sx={{
                    backgroundColor: disabled
                        ? theme.palette.action.disabledBackground
                        : theme.palette.background.paper,
                    // color: theme.palette.text.primary,
                    // '& fieldset': {
                    //     borderColor: theme.palette.divider,
                    // },
                }}
                labelId={id ? `${id}-label` : undefined}
                id={id}
                name={name}
                value={value ?? ''}
                label={label ? t(label) : undefined}
                size={size}
                onChange={onChange}
                onBlur={onBlur}
                aria-describedby={helperTextId}
                inputRef={ref}
                {...restProps}
            >
                {menuItemsList
                    ? menuItemsList
                    : options?.length
                        ? options?.map((option) => <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>)
                        : <MenuItem disabled>{t('No options available')}</MenuItem>}
            </Select>
            {helperText && <FormHelperText id={helperTextId}>{helperText}</FormHelperText>}
        </FormControl>
    );
};

export default GenericDropdown;
