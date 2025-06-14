import React from 'react';
import { SelectChangeEvent } from '@mui/material/Select';
import GenericDropdown, { DropdownOption, GenericDropdownProps } from './GenericDropdown';

interface DropdownControllerProps extends Omit<GenericDropdownProps, 'onChange' | 'options'> {
    value?: string;
    onChange: (value: string) => void;
    options: DropdownOption[];
}

const DropdownController: React.FC<DropdownControllerProps> = ({ value, onChange, options, ...rest }) => {
    const handleChange = (e: SelectChangeEvent) => {
        onChange(e.target.value as string);
    };
    return <GenericDropdown value={value} onChange={handleChange} options={options} {...rest} />;
};

export default DropdownController;
