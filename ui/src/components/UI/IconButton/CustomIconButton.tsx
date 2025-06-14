import React, { Suspense } from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';

interface CustomIconButtonProps extends IconButtonProps {
    icon: string;
}

const CustomIconButton: React.FC<CustomIconButtonProps> = ({ icon, children, ...props }) => {
    const Icon = React.lazy(() => import(`@mui/icons-material/${icon}`));
    return (
        <IconButton {...props}>
            <Suspense fallback={null}>
                {children ? children : <Icon fontSize="small" />}
            </Suspense>
        </IconButton>
    );
};

export default CustomIconButton;
