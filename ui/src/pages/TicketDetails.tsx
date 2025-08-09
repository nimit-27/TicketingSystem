import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { getTicket, updateTicket } from "../services/TicketService";
import { useApi } from "../hooks/useApi";
import Title from "../components/Title";
import RequestDetails from "../components/RaiseTicket/RequestDetails";
import RequestorDetails from "../components/RaiseTicket/RequestorDetails";
import TicketDetailsForm from "../components/RaiseTicket/TicketDetails";
import CustomIconButton from '../components/UI/IconButton/CustomIconButton';
import Switch from "@mui/material/Switch";
import CommentsSection from "../components/Comments/CommentsSection";
import HistorySidebar from "../components/HistorySidebar";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "../context/SnackbarContext";
import { checkFieldAccess } from "../utils/permissions";
import { getStatusList } from "../utils/Utils";
import CustomFieldset from "../components/CustomFieldset";

interface Ticket {
    id: string;
    reportedDate: string;
    mode: string;
    UserId: string;
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
    statusId?: string;
    assignToLevel?: string;
    assignTo?: string;
    assignedToLevel?: string;
    assignedTo?: string;
}

const TicketDetails: React.FC = () => {
    const { ticketId } = useParams();
    const { data: ticket, apiHandler: getTicketApiHandler } = useApi<any>();
    const { apiHandler: updateTicketApiHandler } = useApi<any>();
    const { showMessage } = useSnackbar();
    const { t } = useTranslation();

    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm();
    const statusValue = useWatch({ control, name: 'statusId' });
    const [editing, setEditing] = useState<boolean>(false);
    const [historyOpen, setHistoryOpen] = useState<boolean>(false);

    // API calls
    const getTicketHandler = (ticketId: any) => {
        if (ticketId) getTicketApiHandler(() => getTicket(ticketId));
    }
    const updateTicketHandler = (ticketId: any, data: any) => {
        if (ticketId && data)
            updateTicketApiHandler(() => updateTicket(ticketId, data)).then((res: any) => {
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
            setValue("statusId", ticket.statusId);
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
        const list = getStatusList();
        const reopen = list?.find((s: any) => s.statusCode === 'REOPENED')?.statusId;
        if (checked && reopen) setValue("statusId", reopen);
        else if (ticket) setValue("statusId", ticket.statusId);
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
        setValue("statusId", ticket.statusId);
        setValue("assignedToLevel", ticket.assignToLevel);
        setValue("assignedTo", ticket.assignTo);
    };

    const allowEdit = checkFieldAccess('ticketDetails', 'editMode');


    return (
        <div className="container" style={{ display: 'flex' }}>
            <div style={{ flexGrow: 1, marginRight: historyOpen ? 400 : 0 }}>
                <Title text={`${t('Ticket')} ${ticketId}: ${ticket?.subject}`} />
                {ticket && (
                    <div className="m-3 d-flex align-items-center">
                        <p className="mb-0 me-2">{t('Status')}: {ticket.status}</p>
                        <Switch
                            checked={statusValue === getStatusList()?.find((s: any) => s.statusCode === 'REOPENED')?.statusId}
                            onChange={handleReopenToggle}
                            size="small"
                        />
                        <span className="ms-1">{t('Reopen Ticket')}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmitUpdate)}>
                    <RequestDetails register={register} control={control} errors={errors} disableAll isFieldSetDisabled />


                    <RequestorDetails register={register} control={control} errors={errors} setValue={setValue} disableAll />

                    <TicketDetailsForm
                        register={register}
                        control={control}
                        setValue={setValue}
                        errors={errors}
                        subjectDisabled
                        disableAll={!editing}
                        actionElement={allowEdit && editing ? (
                            <>
                                <CustomIconButton icon="close" onClick={() => { resetFields(); setEditing(false); }} style={{ minWidth: 0, padding: 2 }} />
                                <CustomIconButton icon="check" onClick={handleSubmit(onSubmitUpdate)} style={{ minWidth: 0, padding: 2 }} />
                            </>
                        ) : (
                            <CustomIconButton icon="edit" onClick={() => setEditing(true)} style={{ minWidth: 0, padding: 2 }} />
                        )}
                    />
                </form>

                <CustomFieldset title={t('Comments')} className="mt-4">
                    <CommentsSection ticketId={ticketId as string} />
                </CustomFieldset>
            </div>
            <HistorySidebar ticketId={ticketId as string} open={historyOpen} setOpen={setHistoryOpen} />
        </div>
    );
};

export default TicketDetails;
