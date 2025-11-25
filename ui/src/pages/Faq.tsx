import { Key, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import { getFaqs } from "../services/FaqService";
import { Faq as FaqType } from "../types";
import { useApi } from "../hooks/useApi";
import GenericButton from "../components/UI/Button";
import { checkAccessMaster } from "../utils/permissions";

const requesterFaqs: FaqType[] = [
    {
        id: "static-1",
        questionEn: "How do I create a new ticket as a requester?",
        answerEn: "Open the Raise Ticket page from the sidebar, fill in the required details like subject, category, and description, and click Submit.",
        keywords: "ticket|create|requester"
    },
    {
        id: "static-2",
        questionEn: "Can I update a ticket after submitting it?",
        answerEn: "Yes. Open My Tickets, select your ticket, and use the edit option to update fields that your role allows.",
        keywords: "ticket|update|edit"
    },
    {
        id: "static-3",
        questionEn: "How do I add a comment or clarification to my ticket?",
        answerEn: "Open the ticket details from My Tickets and post your comment in the conversation or comments section.",
        keywords: "comment|conversation|ticket"
    },
    {
        id: "static-4",
        questionEn: "Where can I see the current status of my request?",
        answerEn: "Go to My Tickets to view the status column or open the ticket to see detailed status and timelines.",
        keywords: "status|my tickets|progress"
    },
    {
        id: "static-5",
        questionEn: "How do I close a ticket once my issue is resolved?",
        answerEn: "Open the ticket from My Tickets and use the Close option if it is enabled for requesters.",
        keywords: "close|resolve|requester"
    },
    {
        id: "static-6",
        questionEn: "Can I re-open a closed ticket?",
        answerEn: "If reopening is allowed, select the closed ticket in My Tickets and choose the Reopen action; otherwise raise a new ticket.",
        keywords: "reopen|closed ticket|action"
    },
    {
        id: "static-7",
        questionEn: "How do I attach files to support my request?",
        answerEn: "While raising or editing a ticket, use the attachment section to upload relevant files before submitting.",
        keywords: "attachments|files|upload"
    },
    {
        id: "static-8",
        questionEn: "Who can see the tickets I raise?",
        answerEn: "Your submitted tickets are visible to you, assigned support staff, and supervisors according to access rules.",
        keywords: "visibility|access|requester"
    },
    {
        id: "static-9",
        questionEn: "How can I track SLA timelines for my ticket?",
        answerEn: "Open the ticket details to view due dates and SLA information shown in the ticket timeline.",
        keywords: "SLA|timeline|due date"
    },
    {
        id: "static-10",
        questionEn: "What should I do if I cannot find the category for my issue?",
        answerEn: "Choose the closest matching category and describe your issue clearly in the description field so the team can guide you.",
        keywords: "category|issue type|requester help"
    }
];

const Faq: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { data: faqs, apiHandler } = useApi<any>();
    const canAddQnA = checkAccessMaster(["faq", "QNAButton"]);
    const showAddQnAButton = checkAccessMaster(["faq", "addQnAButton"]);

    console.log({canAddQnA, showAddQnAButton});

    useEffect(() => {
        apiHandler(() => getFaqs());
    }, []);

    const combinedFaqs = [...requesterFaqs, ...(faqs ?? [])];

    return (
        <div className="w-100">
            <Title
                textKey="FAQ"
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
