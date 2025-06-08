import React from "react";

interface TitleProps {
    text: string;
}

const Title: React.FC<TitleProps> = ({ text }) => (
    <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">{text}</h2>
        <div>
            {/* Global icons placeholder */}
        </div>
    </div>
);

export default Title;
