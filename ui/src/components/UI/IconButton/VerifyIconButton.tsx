import React from 'react';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Stack from '@mui/material/Stack';
import CustomIconButton from './CustomIconButton';

type VerifyIconButtonProps = {
    icon?: string;
    onClick?: () => void;
    verified?: boolean;
    pending?: boolean;
    disabled?: boolean;
};

const VerifyIconButton: React.FC<VerifyIconButtonProps> = ({
    onClick,
    verified,
    pending,
    disabled,
}) => {
    return (
        <IconButton
            // onClick={onClick}
            disabled={disabled || pending || verified}
            color={verified ? 'success' : 'primary'}
            aria-label="verify"
            disableRipple
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                {pending
                    ? <CircularProgress size={24} />
                    : verified
                        ? <CheckCircleIcon color="success" />
                        : <CustomIconButton onClick={onClick} icon='send' />
                }
            </Stack>
        </IconButton>
    );
};

export default VerifyIconButton;
