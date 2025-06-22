import React from 'react';
import FormControl from '@mui/material/FormControl';
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
    options?: DropdownOption[];
    fullWidth?: boolean;
    disabled?: boolean;
    name?: string;
    id?: string;
    required?: boolean;
    className?: string;
    menuItemsList?: any;
    style?: React.CSSProperties;
}

const GenericDropdown: React.FC<GenericDropdownProps> = ({
    label,
    value,
    onChange,
    options,
    fullWidth = false,
    disabled = false,
    name,
    id,
    required = false,
    menuItemsList,
    className,
    style,
}) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const classes = `generic-dropdown ${className ?? ''}`.trim();
    // let size: "small" | "medium" = !FciTheme ? "small" : "medium";
    let size: "small" | "medium" = "small";
    return (
        <FormControl fullWidth={fullWidth} disabled={disabled} required={required} style={style} className={classes} size={size}>
            {label && <InputLabel id={id ? `${id}-label` : undefined}>{t(label)}</InputLabel>}
            <Select
                sx={{
                    backgroundColor: theme.palette.background.paper
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
            >
                {menuItemsList
                    ? menuItemsList
                    : options?.length
                        ? options?.map((option) => <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>)
                        : <MenuItem disabled>{t('No options available')}</MenuItem>}
            </Select>
        </FormControl>
    );
};

export default GenericDropdown;
