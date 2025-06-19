import React from "react";
import Title from "../components/Title";

const KnowledgeBase: React.FC = () => {
    return (
        <div className="container">
            {/* <Title text="Knowledge Base" /> */}
            <iframe className="w-100" style={{ height: '88vh' }} src="http://localhost:8080" />
        </div>
    );
};

export default KnowledgeBase;