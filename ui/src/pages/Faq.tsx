import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Faq: React.FC = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();

    const faqs = [
        {
            question: "How do I reset my password?",
            answer: "Click on the 'Forgot password' link on the login page and follow the instructions.",
            keywords: "password|reset|account"
        },
        {
            question: "How can I create a ticket?",
            answer: "Navigate to the create ticket page and fill out the required details.",
            keywords: "ticket|create|help"
        }
    ];

    return (
        <div className="p-3">
            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={() => navigate('/faq/new')}>
                    {t('Add Q & A')}
                </button>
            </div>
            {faqs.map((item, index) => (
                <div key={index} className="mb-4">
                    <h5 className="ts-20" data-keywords={item.keywords}>{item.question}</h5>
                    <p className="ts-16" data-keywords={item.keywords}>{item.answer}</p>
                </div>
            ))}
        </div>
    );
}

export default Faq;