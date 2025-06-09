import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getTicket, updateTicket } from "../services/TicketService";
import { useApi } from "../hooks/useApi";
import Title from "../components/Title";
import RequestDetails from "../components/RaiseTicket/RequestDetails";
import RequestorDetails from "../components/RaiseTicket/RequestorDetails";
import TicketDetailsForm from "../components/RaiseTicket/TicketDetails";
import GenericButton from "../components/UI/Button";
import Switch from "@mui/material/Switch";
import CommentsSection from "../components/Comments/CommentsSection";

interface Ticket {
    id: number;
    reportedDate: string;
    mode: string;
    employeeId: number;
    employee?: {
        name?: string;
        emailId?: string;
        mobileNo?: string;
        role?: string;
        office?: string;
    };
    subject: string;
    description: string;
    category: string;
    subCategory: string;
    priority: string;
    status: string;
    assignToLevel?: string;
    assignTo?: string;
    assignedAtLevel?: string;
    assignedTo?: string;
}

const TicketDetails: React.FC = () => {
    const { ticketId } = useParams();
    const { data: ticket, apiHandler: ticketApiHandler } = useApi<any>();

    const { register, handleSubmit, control, setValue, formState: { errors }, watch } = useForm();
    const formData = watch();

    useEffect(() => {
        if (ticketId) {
            ticketApiHandler(() => getTicket(Number(ticketId)));
        }
    }, [ticketId]);

    useEffect(() => {
        if (ticket) {
            setValue("ticketId", ticket.id);
            setValue("reportedDate", ticket.reportedDate?.slice(0, 10));
            setValue("mode", ticket.mode);
            setValue("employeeId", ticket.employeeId);
            setValue("status", ticket.status);
            setValue("category", ticket.category);
            setValue("subCategory", ticket.subCategory);
            setValue("priority", ticket.priority);
            setValue("subject", ticket.subject);
            setValue("description", ticket.description);
            setValue("assignToLevel", ticket.assignToLevel);
            setValue("assignTo", ticket.assignTo);
            setValue("assignedAtLevel", ticket.assignedAtLevel);
            setValue("assignedTo", ticket.assignedTo);
        }
    }, [ticket]);


    const handleReopenToggle = (e: any) => {
        const checked = e.target.checked;
        if (checked) {
            setValue("status", "REOPENED");
        } else if (ticket) {
            setValue("status", ticket.status);
        }
    };

    const onSubmit = (data: any) => {
        ticketApiHandler(() => updateTicket(Number(ticketId), data));
    };

    return (
        <div className="container">
            <Title text={`Ticket ${ticketId}: ${ticket?.subject}`} />
            {ticket && (
                <div className="m-3 d-flex align-items-center">
                    <p className="mb-0 me-2">Status: {ticket.status}</p>
                    <Switch
                        checked={formData.status === 'REOPENED'}
                        onChange={handleReopenToggle}
                        size="small"
                    />
                    <span className="ms-1">Reopen Ticket</span>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <RequestDetails register={register} control={control} errors={errors} formData={formData} disableAll />
                <RequestorDetails register={register} control={control} errors={errors} formData={formData} setValue={setValue} disableAll />

                <TicketDetailsForm register={register} control={control} errors={errors} formData={formData} subjectDisabled disableAll={false} />
                <GenericButton textKey="Update Ticket" variant="contained" type="submit" />
            </form>

            <CommentsSection ticketId={Number(ticketId)} />
        </div>
    );
};

export default TicketDetails;
