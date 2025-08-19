import React, { useEffect, useState } from "react";
import { cardContainer1Header } from "../constants/bootstrapClasses";
import { FciTheme } from "../config/config";
import { useTheme } from "@mui/material";
import CustomIconButton from "./UI/IconButton/CustomIconButton";
import Fieldset from "./UI/Fieldset";

interface CustomFieldsetProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    actionElement?: React.ReactNode;
    disabled?: boolean;
}

const CustomFieldset: React.FC<CustomFieldsetProps> = ({ title, children, className = "", style, actionElement, disabled }) => {
    const theme = useTheme();
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        document.documentElement.style.setProperty('--sub-heading-text-color', theme.palette.success.main);
        document.documentElement.style.setProperty('--sub-heading-disabled-text-color', theme.palette.success.dark);
    }, [theme.palette.mode]);

    const toggleCollapse = () => setCollapsed(!collapsed);

    if (FciTheme) return (
        <div className="form-container" style={{ ...style }}>
            <div className={`form-title-disabled ${disabled ? '-disabled' : ''} d-flex justify-content-between align-items-center`} onClick={toggleCollapse} style={{ cursor: 'pointer' }}>
                <h4 className="mb-0">{title}</h4>
                <CustomIconButton icon={collapsed ? 'arrowdown' : 'arrowup'} size="small" />
            </div>
            {!collapsed && (
                <div className="p-2">
                    {actionElement && (
                        <div className="d-flex m-2 justify-content-end">
                            {actionElement}
                        </div>
                    )}
                    {children}
                </div>
            )}
        </div>
    );

    return (
        <Fieldset
            title={
                <>
                    <span>{title}</span>
                    <CustomIconButton icon={collapsed ? 'arrowdown' : 'arrowup'} size="small" />
                </>
            }
            className={className}
            style={style}
            legendProps={{ onClick: toggleCollapse }}
        >
            {!collapsed && (
                <div>
                    {actionElement && (
                        <div style={{ position: 'absolute', top: 8, right: 8 }}>
                            {actionElement}
                        </div>
                    )}
                    {children}
                </div>
            )}
        </Fieldset>
    );
};

export default CustomFieldset;
