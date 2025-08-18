import React from "react";
import { useTranslation } from "react-i18next";

interface TitleProps {
    text?: string;
    textKey?: string;
    rightContent?: React.ReactNode;
}

const Title: React.FC<TitleProps> = ({ text, textKey, rightContent }) => {
    const { t } = useTranslation();
    const label = textKey ? t(textKey) : t(text ?? "");
    return (
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="m-0">{label}</h2>
            <div>{rightContent}</div>
        </div>
    );
};

export default Title;
