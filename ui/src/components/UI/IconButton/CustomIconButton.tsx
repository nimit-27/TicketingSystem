import React, { Suspense, useEffect, useState } from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

const iconMap = {
    delete: () => import('@mui/icons-material/Delete'),
    edit: () => import('@mui/icons-material/Edit'),
    send: () => import('@mui/icons-material/Send')
    // Add more icons here
};

type IconKey = keyof typeof iconMap;

interface CustomIconButtonProps extends IconButtonProps {
    icon: string; // Allows any string, lowercase handled internally
}

const CustomIconButton: React.FC<CustomIconButtonProps> = ({ icon, ...props }) => {
    const [IconComponent, setIconComponent] = useState<React.ElementType | null>(null);

    useEffect(() => {
        const key = icon.toLowerCase() as IconKey;
        let isMounted = true;

        if (iconMap[key]) {
            iconMap[key]().then((mod) => {
                if (isMounted) setIconComponent(() => mod.default);
            });
        }

        return () => {
            isMounted = false;
        };
    }, [icon]);

    return (
        <IconButton {...props}>
            <Suspense fallback={<CircularProgress size={20} />}>
                {IconComponent ? <IconComponent fontSize="small" /> : null}
            </Suspense>
        </IconButton>
    );
};

export default CustomIconButton;
