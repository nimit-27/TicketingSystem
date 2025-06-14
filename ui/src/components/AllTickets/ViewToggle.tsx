import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';

interface ToggleOption {
    icon: React.ElementType;
    value: string;
}

interface ViewToggleProps {
    value: string;
    onChange: (val: string) => void;
    options: ToggleOption[];
}

const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange, options }) => (
    <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, val) => val && onChange(val)}
        size="small"
    >
        {options.map((o, i) => {
            const Icon = o.icon;
            return (
                <ToggleButton key={i} value={o.value}>
                    <Icon fontSize="small" />
                </ToggleButton>
            );
        })}
    </ToggleButtonGroup>
);

export default ViewToggle;
