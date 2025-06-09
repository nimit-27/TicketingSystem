import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getTicket, updateTicket, addComment, getComments } from "../services/TicketService";
import { useApi } from "../hooks/useApi";
import Title from "../components/Title";
import RequestDetails from "../components/RaiseTicket/RequestDetails";
import RequestorDetails from "../components/RaiseTicket/RequestorDetails";
import TicketDetailsForm from "../components/RaiseTicket/TicketDetails";
import GenericButton from "../components/UI/Button";
import GenericDropdownController from "../components/UI/Dropdown/GenericDropdownController";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";

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
}

interface Comment {
    id: number;
    comment: string;
    createdAt: string;
}

const statusOptions: DropdownOption[] = [
    { label: "Pending", value: "PENDING" },
    { label: "On Hold", value: "ON_HOLD" },
    { label: "Closed", value: "CLOSED" },
    { label: "Reopened", value: "REOPENED" },
];

const TicketDetails: React.FC = () => {
    const { ticketId } = useParams();
    const { data: ticket, apiHandler } = useApi<any>();
    const { data: commentsData, apiHandler: getCommentsHandler } = useApi<any>();
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");

    const { register, handleSubmit, control, setValue, formState: { errors }, watch } = useForm();
    const formData = watch();

    useEffect(() => {
        if (ticketId) {
            apiHandler(() => getTicket(Number(ticketId)));
            loadComments(5);
        }
    }, [ticketId]);

    useEffect(() => {
        console.log("Ticket data:", ticket);
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
        }
    }, [ticket]);

    const loadComments = (count?: number) => {
        getCommentsHandler(() => getComments(Number(ticketId), count)).then((c: any) => setComments(c));
    };

    const postComment = () => {
        if (!commentText) return;
        apiHandler(() => addComment(Number(ticketId), commentText)).then(() => {
            setCommentText("");
            loadComments();
        });
    };

    const onSubmit = (data: any) => {
        apiHandler(() => updateTicket(Number(ticketId), data));
    };

    return (
        <div className="container">
            <Title text={`Ticket ${ticketId}: ${ticket?.subject}`} />
            {ticket && (
                <div className="m-3">
                    <p>Status: {ticket.status}</p>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <RequestDetails register={register} control={control} errors={errors} formData={formData} disableAll />
                <RequestorDetails register={register} control={control} errors={errors} formData={formData} setValue={setValue} disableAll />
                <GenericDropdownController
                    name="status"
                    control={control}
                    label="Update Status"
                    options={statusOptions}
                    className="form-select m-3 w-25"
                />
                <TicketDetailsForm register={register} control={control} errors={errors} formData={formData} subjectDisabled disableAll={false} />
                <GenericButton textKey="Update Ticket" variant="contained" type="submit" />
            </form>

            <div className="border p-3 mb-3">
                <textarea
                    className="form-control mb-2"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                />
                <button className="btn btn-primary" onClick={postComment}>Post</button>
            </div>
            <div>
                {comments.length === 0 && <p>No comments</p>}
                {comments.map((c) => (
                    <div key={c.id} className="border p-2 mb-2">
                        {c.comment}
                    </div>
                ))}
                {comments.length > 0 && (
                    <button className="btn btn-link" onClick={() => loadComments()}>Show more</button>
                )}
            </div>
        </div>
    );
};

export default TicketDetails;
