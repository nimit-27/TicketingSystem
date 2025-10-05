import React from 'react';
import { Chip } from '@mui/material';

export type AllChildrenState = 'neutral' | 'all' | 'none';

interface AllChildrenChipProps {
    state: AllChildrenState;
    onClick: () => void;
    disabled?: boolean;
}

const getChipConfig = (state: AllChildrenState): { color: 'default' | 'success' | 'error'; variant: 'filled' | 'outlined' } => {
    switch (state) {
        case 'all':
            return { color: 'success', variant: 'filled' };
        case 'none':
            return { color: 'error', variant: 'filled' };
        default:
            return { color: 'default', variant: 'outlined' };
    }
};

const AllChildrenChip: React.FC<AllChildrenChipProps> = ({ state, onClick, disabled = false }) => {
    const chipConfig = getChipConfig(state);

    return (
        <Chip
            size="small"
            label="All children"
            color={chipConfig.color}
            variant={chipConfig.variant}
            onClick={onClick}
            disabled={disabled}
            className="text-capitalize"
        />
    );
};

export default AllChildrenChip;
