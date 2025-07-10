import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { getTicket, updateTicket } from "../services/TicketService";
import { useApi } from "../hooks/useApi";
import Title from "../components/Title";
import RequestDetails from "../components/RaiseTicket/RequestDetails";
import RequestorDetails from "../components/RaiseTicket/RequestorDetails";
import TicketDetailsForm from "../components/RaiseTicket/TicketDetails";
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import Switch from "@mui/material/Switch";
import CommentsSection from "../components/Comments/CommentsSection";
import HistorySidebar from "../components/HistorySidebar";
import { IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "../context/SnackbarContext";

interface Ticket {
    id: number;
    reportedDate: string;
    mode: string;
    UserId: number;
    requestorName?: string;
    requestorEmailId?: string;
    requestorMobileNo?: string;
    subject: string;
    description: string;
    category: string;
    subCategory: string;
    priority: string;
    severity?: string;
    recommendedSeverity?: string;
    impact?: string;
    severityRecommendedBy?: string;
    status: string;
    assignToLevel?: string;
    assignTo?: string;
    assignedAtLevel?: string;
    assignedTo?: string;
}

const TicketDetails: React.FC = () => {
    const { ticketId } = useParams();
    const { data: ticket, apiHandler: getTicketApiHandler } = useApi<any>();
    const { apiHandler: updateTicketApiHandler } = useApi<any>();
    const { showMessage } = useSnackbar();
    const { t } = useTranslation();

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm();
    const statusValue = useWatch({ control, name: 'status' });
    const [editing, setEditing] = useState<boolean>(false);

    // API calls
    const getTicketHandler = (ticketId: any) => {
        if (ticketId) getTicketApiHandler(() => getTicket(Number(ticketId)));
    }
    const updateTicketHandler = (ticketId: any, data: any) => {
        if (ticketId && data)
            updateTicketApiHandler(() => updateTicket(Number(ticketId), data)).then((res: any) => {
                setEditing(false);
                if (res?.message) {
                    showMessage(res.message, 'success');
                }
            });
    }


    useEffect(() => {
        getTicketHandler(ticketId);
    }, [ticketId]);

    // Populating the ticket form - View Mode
    useEffect(() => {
        if (ticket) {
            setValue("ticketId", ticket.id);
            setValue("reportedDate", ticket.reportedDate?.slice(0, 10));
            setValue("mode", ticket.mode);
            setValue("UserId", ticket.UserId);
            setValue("stakeholder", ticket.stakeholder);
            setValue("requestorName", ticket.requestorName);
            setValue("status", ticket.status);
            setValue("category", ticket.category);
            setValue("subCategory", ticket.subCategory);
            setValue("priority", ticket.priority);
            setValue("severity", ticket.severity);
            setValue("impact", ticket.impact);
            setValue("severityRecommendedBy", ticket.severityRecommendedBy);
            setValue("subject", ticket.subject);
            setValue("description", ticket.description);
            setValue("assignToLevel", ticket.assignToLevel);
            setValue("assignTo", ticket.assignTo);
            setValue("assignedToLevel", ticket.assignedToLevel);
            setValue("assignedTo", ticket.assignedTo);
        }
    }, [ticket]);

    // Updating ticket
    const onSubmitUpdate = (data: any) => updateTicketHandler(ticketId, data);

    const handleReopenToggle = (e: any) => {
        const checked = e.target.checked;
        if (checked) setValue("status", "REOPENED");
        else if (ticket) setValue("status", ticket.status);
    };

    // Reset fields back to the original data
    const resetFields = () => {
        if (!ticket) return;
        setValue("category", ticket.category);
        setValue("subCategory", ticket.subCategory);
        setValue("priority", ticket.priority);
        setValue("severity", ticket.severity);
        setValue("impact", ticket.impact);
        setValue("severityRecommendedBy", ticket.severityRecommendedBy);
        setValue("description", ticket.description);
        setValue("status", ticket.status);
        setValue("assignedToLevel", ticket.assignToLevel);
        setValue("assignedTo", ticket.assignTo);
    };

    return (
        <div className="container">
            <Title text={`${t('Ticket')} ${ticketId}: ${ticket?.subject}`} />
            {ticket && (
                <div className="m-3 d-flex align-items-center">
                    <p className="mb-0 me-2">{t('Status')}: {ticket.status}</p>
                    <Switch
                        checked={statusValue === 'REOPENED'}
                        onChange={handleReopenToggle}
                        size="small"
                    />
                    <span className="ms-1">{t('Reopen Ticket')}</span>
                </div>
            )}

            <HistorySidebar ticketId={Number(ticketId)} />
            
            <form onSubmit={handleSubmit(onSubmitUpdate)}>
                <RequestDetails register={register} control={control} errors={errors} disableAll isFieldSetDisabled />


                <RequestorDetails register={register} control={control} errors={errors} setValue={setValue} disableAll />

                <TicketDetailsForm
                    register={register}
                    control={control}
                    errors={errors}
                    subjectDisabled
                    disableAll={!editing}
                    actionElement={editing ? (
                        <>
                            <IconButton onClick={() => { resetFields(); setEditing(false); }} style={{ minWidth: 0, padding: 2 }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={handleSubmit(onSubmitUpdate)} style={{ minWidth: 0, padding: 2 }}>
                                <CheckIcon fontSize="small" />
                            </IconButton>
                        </>
                    ) : (
                        <IconButton onClick={() => setEditing(true)} style={{ minWidth: 0, padding: 2 }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                    )}
                />
            </form>

            <CommentsSection ticketId={Number(ticketId)} />
        </div>
    );
};

export default TicketDetails;
