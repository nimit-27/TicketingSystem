import React, { ReactNode } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

interface GenericButtonProps extends ButtonProps {
    textKey?: string;
    children?: ReactNode;
}

const GenericButton: React.FC<GenericButtonProps> = ({
    textKey,
    children,
    className,
    color = "success",
    ...props
}) => {
    const { t } = useTranslation();
    return (
        <Button color={color} {...props}>
            {textKey ? t(textKey) : children}
        </Button>
    );
};

export default GenericButton;
