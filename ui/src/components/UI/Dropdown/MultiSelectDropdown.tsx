import React, { useMemo } from 'react';
import {
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
} from '@mui/material';
import { DropdownOption } from './GenericDropdown';

interface MultiSelectDropdownProps {
    label: string;
    value: string[];
    onChange: (values: string[]) => void;
    options: DropdownOption[];
    className?: string;
    disabled?: boolean;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    label,
    value,
    onChange,
    options,
    className,
    disabled,
}) => {
    const valueSet = useMemo(() => new Set(value), [value]);

    const handleChange = (event: SelectChangeEvent<string[]>) => {
        const rawValue = event.target.value;
        onChange(typeof rawValue === 'string' ? rawValue.split(',') : rawValue);
    };

    const selectedLabel = useMemo(() => {
        const labels = options
            .filter((option) => valueSet.has(option.value) && option.value !== 'All')
            .map((option) => option.label);
        return labels.length ? labels.join(', ') : 'All';
    }, [options, valueSet]);

    return (
        <FormControl fullWidth className={className} size="medium" disabled={disabled}>
            <InputLabel>{label}</InputLabel>
            <Select
                multiple
                value={value}
                onChange={handleChange}
                label={label}
                renderValue={() => selectedLabel}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Checkbox checked={valueSet.has(option.value)} />
                        <ListItemText primary={option.label} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default MultiSelectDropdown;
