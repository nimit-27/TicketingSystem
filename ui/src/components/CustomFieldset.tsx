import React, { useContext, useEffect, useState } from "react";
import { basicFieldset1Header, cardContainer1Header } from "../constants/bootstrapClasses";
import { FciTheme } from "../config/config";
import { useTheme } from "@mui/material";
import CustomIconButton from "./UI/IconButton/CustomIconButton";
import Fieldset from "./UI/Fieldset";
import { ThemeModeContext } from "../context/ThemeContext";

interface CustomFieldsetProps {
    title?: string;
    variant?: "bordered" | "basic" | "default";
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    actionElement?: React.ReactNode;
    disabled?: boolean;
}

const CustomFieldset: React.FC<CustomFieldsetProps> = ({
    title,
    variant = "default",
    children,
    className = "",
    style,
    actionElement,
    disabled
}) => {
    const theme = useTheme();
    const { layout } = useContext(ThemeModeContext);
    const [collapsed, setCollapsed] = useState(false);

    // Store variant in state to trigger rerender
    const [currentVariant, setCurrentVariant] = useState<"bordered" | "basic" | "default">(variant);

    useEffect(() => {
        document.documentElement.style.setProperty('--sub-heading-text-color', theme.palette.success.main);
        document.documentElement.style.setProperty('--sub-heading-disabled-text-color', theme.palette.success.dark);
    }, [theme.palette.mode]);

    useEffect(() => {
        // Update variant based on layout
        if (layout === 1) setCurrentVariant("bordered");
        else if (layout === 2) setCurrentVariant("default");
        else if (layout === 3) setCurrentVariant("basic");
    }, [layout]);

    // Also update if the prop changes
    useEffect(() => {
        variant !== null && setCurrentVariant(variant);
    }, [variant]);

    const toggleCollapse = () => setCollapsed(!collapsed);

    if (currentVariant === "default") return (
        <div className={`mb-4 ${className}`} style={{ ...style }}>
            {/* <div className={`form-title-disabled ${disabled ? '-disabled' : ''} d-flex justify-content-between align-items-center`} onClick={toggleCollapse} style={{ cursor: 'pointer' }}> */}
            <div className={`d-flex justify-content-between align-items-center`} onClick={toggleCollapse} style={{ cursor: 'pointer' }}>
                <h4 className="mb-3 ts-16 fw-bold" style={{color: theme.palette.global.fieldset.header.text}}>{title}</h4>
                <CustomIconButton icon={collapsed ? 'arrowdown' : 'arrowup'} size="small" />
            </div>
            {!collapsed && (
                <div className="">
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

    if (currentVariant === "bordered") return (
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
            collapsed={collapsed}
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

    if (currentVariant === "basic") return (
        <fieldset
            className={`border position-relative rounded mb-4 px-3 p-0 ${className}`}
            style={style}
        >
            <legend
                className={`${basicFieldset1Header} d-flex justify-content-between align-items-center`}
                style={{
                    width: "min-content",
                    marginRight: "2rem",
                }}
            >
                {title}
            </legend>
            {children}
        </fieldset>
    );

    return null;
};

export default CustomFieldset;
