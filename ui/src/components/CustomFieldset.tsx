import React, { useEffect } from "react";
import { cardContainer1Header } from "../constants/bootstrapClasses";
import { FciTheme } from "../config/config";
import { useTheme } from "@mui/material";

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

    console.log(theme)
    
    useEffect(() => {
        console.log(theme)
        document.documentElement.style.setProperty('--sub-heading-text-color', theme.palette.success.main);
        document.documentElement.style.setProperty('--sub-heading-disabled-text-color', theme.palette.success.dark);
    }, [theme.palette.mode]);

    if (FciTheme) return (
        <div className="form-container">
            <div className={`form-title-disabled ${true ? '-disabled' : ''}`}>
                <h4>{title}</h4>
            </div>
            <div className="p-2">
                {actionElement && (
                    <div className="d-flex m-2 justify-content-end">
                        {actionElement}
                    </div>
                )}
                {children}
            </div>
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
                className={`${cardContainer1Header}`}
                style={{
                    width: "fit-content",
                    fontSize: "1rem",
                    fontWeight: "500",
                    padding: "0 8px",
                    margin: "0",
                    position: "absolute",
                    top: "-1.1rem",
                    left: "1rem",
                    backgroundColor: "white",
                    display: "inline-block"
                }}
            >
                {title}
            </legend>
            {actionElement && (
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    {actionElement}
                </div>
            )}
            {children}
        </fieldset>
    );
};

export default CustomFieldset;
