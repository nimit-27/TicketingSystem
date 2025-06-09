import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { getTicket, updateTicket, addComment, getComments, updateComment, deleteComment } from "../services/TicketService";
import { useApi } from "../hooks/useApi";
import Title from "../components/Title";
import RequestDetails from "../components/RaiseTicket/RequestDetails";
import RequestorDetails from "../components/RaiseTicket/RequestorDetails";
import TicketDetailsForm from "../components/RaiseTicket/TicketDetails";
import GenericButton from "../components/UI/Button";
import GenericDropdownController from "../components/UI/Dropdown/GenericDropdownController";
import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";
import Switch from "@mui/material/Switch";
import CustomFormInput from "../components/UI/Input/CustomFormInput";
import { Roles } from "../config/config";

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
    { label: "Resolved", value: "RESOLVED" },
    { label: "Assign Further", value: "ASSIGN_FURTHER" },
];

const assignLevelOptions: DropdownOption[] = Roles.filter(r => r !== "USER").map(r => ({ label: r, value: r }));
const assignToOptions: DropdownOption[] = assignLevelOptions;

const TicketDetails: React.FC = () => {
    const { ticketId } = useParams();
    const { data: ticket, apiHandler: ticketApiHandler } = useApi<any>();
    const { apiHandler: commentsApiHandler } = useApi<any>();
    const { apiHandler: addCommentApiHandler } = useApi<any>();
    const { apiHandler: updateCommentApiHandler } = useApi<any>();
    const { apiHandler: deleteCommentApiHandler } = useApi<any>();
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editText, setEditText] = useState("");
    const [showMore, setShowMore] = useState(false);

    const { register, handleSubmit, control, setValue, formState: { errors }, watch } = useForm();
    const formData = watch();
    const currentUserRole = localStorage.getItem('role') || 'USER';

    useEffect(() => {
        if (ticketId) {
            ticketApiHandler(() => getTicket(Number(ticketId)));
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
            setValue("assignToLevel", ticket.assignToLevel);
            setValue("assignTo", ticket.assignTo);
            setValue("assignedAtLevel", ticket.assignedAtLevel);
            setValue("assignedTo", ticket.assignedTo);
        }
    }, [ticket]);

    const loadComments = (count?: number) => {
        commentsApiHandler(() => getComments(Number(ticketId))).then((all: any) => {
            if (count && all.length > count) {
                setComments(all.slice(0, count));
                setShowMore(true);
            } else {
                setComments(all);
                setShowMore(false);
            }
        });
    };

    const postComment = () => {
        if (!commentText) return;
        addCommentApiHandler(() => addComment(Number(ticketId), commentText)).then(() => {
            setCommentText("");
            loadComments();
        });
    };

    const startEdit = (c: Comment) => {
        setEditingCommentId(c.id);
        setEditText(c.comment);
    };

    const saveEdit = (id: number) => {
        updateCommentApiHandler(() => updateComment(id, editText)).then(() => {
            setEditingCommentId(null);
            setEditText("");
            loadComments(comments.length);
        });
    };

    const removeComment = (id: number) => {
        deleteCommentApiHandler(() => deleteComment(id)).then(() => {
            loadComments(comments.length);
        });
    };

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
                <GenericDropdownController
                    name="status"
                    control={control}
                    label="Update Status"
                    options={statusOptions}
                    className="form-select m-3 w-25"
                />

                {currentUserRole !== 'USER' && formData.status === 'ASSIGN_FURTHER' && (
                    <div className="m-3 d-flex">
                        <div className="me-3" style={{ flex: 1 }}>
                            <GenericDropdownController
                                name="assignToLevel"
                                control={control}
                                label="Assign to Level"
                                options={assignLevelOptions}
                                className="form-select"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <GenericDropdownController
                                name="assignTo"
                                control={control}
                                label="Assign to"
                                options={assignToOptions}
                                className="form-select"
                            />
                        </div>
                    </div>
                )}

                <div className="m-3 d-flex">
                    <div className="me-3" style={{ flex: 1 }}>
                        <CustomFormInput
                            name="assignedAtLevel"
                            label="Assigned at Level"
                            register={register}
                            errors={errors}
                            disabled
                            showLabel
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <CustomFormInput
                            name="assignedTo"
                            label="Assigned to"
                            register={register}
                            errors={errors}
                            disabled
                            showLabel
                        />
                    </div>
                </div>
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
                        {editingCommentId === c.id ? (
                            <>
                                <textarea
                                    className="form-control mb-2"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                />
                                <button className="btn btn-primary btn-sm me-2" onClick={() => saveEdit(c.id)}>Save</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditingCommentId(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <div>{c.comment}</div>
                                <button className="btn btn-link btn-sm" onClick={() => startEdit(c)}>Edit</button>
                                <button className="btn btn-link btn-sm text-danger" onClick={() => removeComment(c.id)}>Delete</button>
                            </>
                        )}
                    </div>
                ))}
                {showMore && (
                    <button className="btn btn-link" onClick={() => loadComments()}>Show more</button>
                )}
            </div>
        </div>
    );
};

export default TicketDetails;
