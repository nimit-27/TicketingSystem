import React from "react";
import { cardContainer1Header } from "../constants/bootstrapClasses";

interface CustomFieldsetProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    actionElement?: React.ReactNode;
}

const CustomFieldset: React.FC<CustomFieldsetProps> = ({ title, children, className = "", style, actionElement }) => {
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
