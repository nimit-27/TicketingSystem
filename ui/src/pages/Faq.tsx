import { Key, useEffect, useMemo, useState } from "react";
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
    const { data: faqs, apiHandler } = useApi<FaqType[]>();
    const canAddQnA = checkAccessMaster(["faq", "QNAButton"]);
    const showAddQnAButton = checkAccessMaster(["faq", "addQnAButton"]);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        apiHandler(() => getFaqs());
    }, []);

    const combinedFaqs = useMemo(() => faqs ?? [], [faqs]);

    const toggleAnswer = (id: string) => {
        setExpandedIds(prev => {
            const updated = new Set(prev);
            if (updated.has(id)) {
                updated.delete(id);
            } else {
                updated.add(id);
            }
            return updated;
        });
    };

    return (
        <div className="w-100">
            <Title
                textKey="Frequently Asked Questions"
                rightContent={
                    showAddQnAButton ? (
                        <GenericButton variant="contained" onClick={() => navigate('/faq/new')}>
                            {t('Add Q & A')}
                        </GenericButton>
                    ) : null
                }
            />
            {combinedFaqs.map((item: FaqType, index: Key | null | undefined) => {
                const question = i18n.language === 'hi' ? (item.questionHi || item.questionEn) : (item.questionEn || item.questionHi);
                const answer = i18n.language === 'hi' ? (item.answerHi || item.answerEn) : (item.answerEn || item.answerHi);
                const isEditable = canAddQnA && !`${item.id}`.startsWith('static-');
                const itemId = `${item.id ?? index}`;
                const isExpanded = expandedIds.has(itemId);
                return (
                    <div key={index} className="mb-4 pb-3 border-bottom border-secondary-subtle">
                        <button
                            type="button"
                            onClick={() => toggleAnswer(itemId)}
                            className="btn w-100 text-start p-0 border-0 bg-transparent d-flex justify-content-between align-items-center"
                            aria-expanded={isExpanded}
                        >
                            <h5 className="ts-20 mb-0" data-keywords={item.keywords}>{question}</h5>
                            <span className="ts-20" aria-hidden>{isExpanded ? '−' : '+'}</span>
                        </button>
                        {isExpanded && (
                            <p className="ts-16 mt-3 mb-0" data-keywords={item.keywords}>{answer}</p>
                        )}
                        {isEditable && (
                            <div className="mt-3">
                                <GenericButton variant="outlined" onClick={() => navigate(`/faq/${item.id}/edit`)}>
                                    {t('Edit Q & A')}
                                </GenericButton>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default Faq;
