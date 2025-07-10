import React, { useEffect, useState } from "react";
import { cardContainer1Header } from "../constants/bootstrapClasses";
import { FciTheme } from "../config/config";
import { useTheme } from "@mui/material";
import CustomIconButton from "./UI/IconButton/CustomIconButton";

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
        <div className="form-container">
            <div className={`form-title-disabled ${disabled ? '-disabled' : ''} d-flex justify-content-between align-items-center`} onClick={toggleCollapse} style={{cursor:'pointer'}}>
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
        <fieldset
            className={`border p-4 pt-5 position-relative rounded mb-4 ${className}`}
            style={{
                ...style
            }}
        >
            <legend
                className={`${cardContainer1Header} d-flex justify-content-between align-items-center`}
                style={{
                    width: "calc(100% - 2rem)",
                    fontSize: "1rem",
                    fontWeight: "500",
                    padding: "0 8px",
                    margin: "0",
                    position: "absolute",
                    top: "-1.1rem",
                    left: "1rem",
                    backgroundColor: "white",
                    display: "flex"
                }}
                onClick={toggleCollapse}
            >
                <span>{title}</span>
                <CustomIconButton icon={collapsed ? 'arrowdown' : 'arrowup'} size="small" />
            </legend>
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
        </fieldset>
    );
};

export default CustomFieldset;
