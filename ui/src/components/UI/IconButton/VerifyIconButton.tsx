import React from 'react';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Stack from '@mui/material/Stack';
import GenericButton from '../Button';

type VerifyIconButtonProps = {
    icon?: string;
    onClick?: () => void;
    verified?: boolean;
    pending?: boolean;
    disabled?: boolean;
};

const VerifyIconButton: React.FC<VerifyIconButtonProps> = ({
    icon,
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
                        : <GenericButton onClick={onClick} size='small'>Verify</GenericButton>
                }
            </Stack>
        </IconButton>
    );
};

export default VerifyIconButton;
