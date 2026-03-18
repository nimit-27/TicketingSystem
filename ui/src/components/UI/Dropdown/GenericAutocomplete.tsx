import React, { useMemo } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { DropdownOption } from './GenericDropdown';

interface GenericAutocompleteProps {
    label: string;
    value: string[];
    onChange: (values: string[]) => void;
    options: DropdownOption[];
    className?: string;
    disabled?: boolean;
}

const GenericAutocomplete: React.FC<GenericAutocompleteProps> = ({
    label,
    value,
    onChange,
    options,
    className,
    disabled,
}) => {
    const selectedOptions = useMemo(
        () => options.filter((option) => value.includes(option.value)),
        [options, value],
    );

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={options}
            value={selectedOptions}
            disabled={disabled}
            onChange={(_, nextOptions) => onChange(nextOptions.map((option) => option.value))}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, selected) => option.value === selected.value}
            className={className}
            renderInput={(params) => <TextField {...params} label={label} size="small" />}
        />
    );
};

export default GenericAutocomplete;
