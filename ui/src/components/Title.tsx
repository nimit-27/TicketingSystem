import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material";

interface TitleProps {
    text?: string;
    textKey?: string;
    rightContent?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLHeadingElement>;
}

const Title: React.FC<TitleProps> = ({ text, textKey, rightContent, onClick }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const label = textKey ? t(textKey) : t(text ?? "");

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3
                    className="m-0 ts-20 fw-semibold"
                    onClick={onClick}
                    style={{ cursor: onClick ? 'pointer' : '', color: theme.palette.global.pageTitle.text }}
                >
                    {label}
                </h3>
                <div>{rightContent}</div>
            </div>
        </>
    );
};

export default Title;
