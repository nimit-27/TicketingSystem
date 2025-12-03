import React, { useEffect, useState } from "react";
import { filegatorEnabled } from "../config/config";
import FileManagementSystem from "./FileManagementSystem";
import { initFilegatorSession } from "../services/FilegatorService";

const KnowledgeBase: React.FC = () => {
    const [iframeSrc, setIframeSrc] = useState<string>("");

    useEffect(() => {
        if (!filegatorEnabled) {
            return;
        }
        initFilegatorSession()
            .then(() => setIframeSrc("http://localhost:8080"))
            .catch(() => setIframeSrc("http://localhost:8080"));
    }, []);

    if (!filegatorEnabled) {
        return <FileManagementSystem />;
    }

    return (
        <div className="container">
            {/* <Title text="Knowledge Base" /> */}
            <iframe className="w-100" style={{ height: '88vh' }} src={iframeSrc} />
        </div>
    );
};

export default KnowledgeBase;
