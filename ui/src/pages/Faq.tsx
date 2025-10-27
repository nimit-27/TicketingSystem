import { Key, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { getFaqs } from "../services/FaqService";
import { Faq as FaqType } from "../types";
import { useApi } from "../hooks/useApi";
import GenericButton from "../components/UI/Button";
import { checkAccessMaster } from "../utils/permissions";

const Faq: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { data: faqs, apiHandler } = useApi<any>();
    const canAddQnA = checkAccessMaster(["faq", "addQnAButton"]);

    useEffect(() => {
        apiHandler(() => getFaqs());
    }, []);

    return (
        <div className="w-100">
            <Title
                textKey="FAQ"
                rightContent={
                    canAddQnA ? (
                        <GenericButton variant="contained" onClick={() => navigate('/faq/new')}>
                            {t('Add Q & A')}
                        </GenericButton>
                    ) : null
                }
            />
            {(faqs ?? []).map((item: FaqType, index: Key | null | undefined) => {
                const question = i18n.language === 'hi' ? (item.questionHi || item.questionEn) : (item.questionEn || item.questionHi);
                const answer = i18n.language === 'hi' ? (item.answerHi || item.answerEn) : (item.answerEn || item.answerHi);
                return (
                    <div key={index} className="mb-4">
                        <h5 className="ts-20" data-keywords={item.keywords}>{question}</h5>
                        <p className="ts-16" data-keywords={item.keywords}>{answer}</p>
                    </div>
                );
            })}
        </div>
    );
}

export default Faq;
