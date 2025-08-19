import React from "react";
import { cardContainer1Header } from "../../../constants/bootstrapClasses";

interface FieldsetProps {
    title: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    legendProps?: React.HTMLAttributes<HTMLLegendElement>;
}

const Fieldset: React.FC<FieldsetProps> = ({ title, children, className = "", style, legendProps }) => {
    return (
        <fieldset
            className={`border p-4 pt-5 position-relative rounded mb-4 ${className}`}
            style={style}
        >
            <legend
                {...legendProps}
                className={`${cardContainer1Header} d-flex justify-content-between align-items-center`}
                style={{
                    width: "calc(100% - 2rem)",
                    fontSize: "1rem",
                    fontWeight: "500",
                    padding: "0 8px",
                    margin: 0,
                    position: "absolute",
                    top: "-1.1rem",
                    left: "1rem",
                    backgroundColor: "white",
                    display: "flex",
                }}
            >
                {title}
            </legend>
            {children}
        </fieldset>
    );
};

export default Fieldset;

