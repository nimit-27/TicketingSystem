import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import RadioToggleGroup from './RadioToggleGroup';
import { IconComponent } from './IconButton/CustomIconButton';
import { ToggleOption } from '../../types';

interface ViewToggleProps {
    value: string;
    onChange: any;
    options: ToggleOption[];
    radio?: boolean;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange, options, radio }) => {
    if (radio) {
        return (
            <RadioToggleGroup
                value={value}
                onChange={onChange}
                options={options}
            />
        );
    }

    return (
        <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, val) => val && onChange(val)}
            size="small"
        >
            {options.map((o, i) => {
                const showIcon = !!o.icon;
                return (
                    <ToggleButton key={i} value={o.value}>
                        {showIcon && <IconComponent icon={o.icon as string} fontSize="small" />}
                        {o.label && <span style={{ marginLeft: showIcon ? 4 : 0 }}>{o.label}</span>}
                    </ToggleButton>
                );
            })}
        </ToggleButtonGroup>
    );
};

export default ViewToggle;
