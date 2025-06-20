import React, { useEffect } from "react";
import Title from "../components/Title";
import { initFilegatorSession } from "../services/FilegatorService";

const KnowledgeBase: React.FC = () => {
    useEffect(() => {
        initFilegatorSession();
    }, []);

    return (
        <div className="container">
            {/* <Title text="Knowledge Base" /> */}
            <iframe className="w-100" style={{ height: '88vh' }} src="http://localhost:8080" />
        </div>
    );
};

export default KnowledgeBase;