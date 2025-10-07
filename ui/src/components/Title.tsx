import React from "react";
import { useTranslation } from "react-i18next";

interface TitleProps {
    text?: string;
    textKey?: string;
    rightContent?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLHeadingElement>;
}

const Title: React.FC<TitleProps> = ({ text, textKey, rightContent, onClick }) => {
    const { t } = useTranslation();
    const label = textKey ? t(textKey) : t(text ?? "");
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2">
                <h2
                    className="m-0"
                    onClick={onClick}
                    style={onClick ? { cursor: 'pointer' } : undefined}
                >
                    {label}
                </h2>
                <div>{rightContent}</div>
            </div>
            {/* <div className="position-relative">
                <hr className="position-absolute" style={{ width: '100vw', left: '-28px', top: '-35px' }} />
            </div> */}
        </>
    );
};

export default Title;
