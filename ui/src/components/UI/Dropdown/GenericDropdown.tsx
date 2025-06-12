import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

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
    return (
        <FormControl fullWidth={fullWidth} disabled={disabled} required={required} style={style} className={className} size='small'>
            {label && <InputLabel id={id ? `${id}-label` : undefined}>{label}</InputLabel>}
            <Select
                labelId={id ? `${id}-label` : undefined}
                id={id}
                name={name}
                value={value ?? ""}
                label={label}
                size='small'
                onChange={onChange}
            >
                {console.log({ options })}
                {menuItemsList
                    ? menuItemsList
                    : options?.length
                        ? options?.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)
                        : <MenuItem disabled>No options available</MenuItem>}
            </Select>
        </FormControl>
    );
};

export default GenericDropdown;