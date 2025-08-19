import React, { ReactNode } from 'react';

interface CustomFieldsetProps {
    title: string;
    children: ReactNode;
    className?: string;
}

const CustomFieldset: React.FC<CustomFieldsetProps> = ({ title, children, className }) => (
    <fieldset className={`border rounded p-3 ${className || ''}`}>
        <legend className="float-none w-auto px-2 mb-0">{title}</legend>
        {children}
    </fieldset>
);

export default CustomFieldset;
