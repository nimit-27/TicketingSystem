import React, { useEffect, useState } from "react";
import Title from "../components/Title";
import { initFilegatorSession } from "../services/FilegatorService";

const KnowledgeBase: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string>("");

    useEffect(() => {
        const creds = localStorage.getItem('creds');
        if (!creds) return;
        const { userId, password } = JSON.parse(creds);
        initFilegatorSession(userId, password)
            .then(() => setIframeSrc("http://localhost:8080"))
            .catch(() => setIframeSrc("http://localhost:8080"));
    }, []);

    return (
        <div className="container">
            {/* <Title text="Knowledge Base" /> */}
            <iframe className="w-100" style={{ height: '88vh' }} src={iframeSrc} />
        </div>
    );
};

export default KnowledgeBase;