import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTicket, updateTicket, addComment, getComments } from "../services/TicketService";
import { useApi } from "../hooks/useApi";
import Title from "../components/Title";

interface Ticket {
    id: number;
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

const TicketDetails: React.FC = () => {
    const { ticketId } = useParams();
    const { data: ticket, apiHandler } = useApi<Ticket>();
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        if (ticketId) {
            apiHandler(() => getTicket(Number(ticketId)));
            loadComments(5);
        }
    }, [ticketId]);

    const loadComments = (count?: number) => {
        apiHandler(() => getComments(Number(ticketId), count)).then((c: any) => setComments(c));
    };

    const postComment = () => {
        if (!commentText) return;
        apiHandler(() => addComment(Number(ticketId), commentText)).then(() => {
            setCommentText("");
            loadComments();
        });
    };

    return (
        <div className="container">
            <Title text={`Ticket ${ticketId}`} />
            {ticket && (
                <div>
                    <p>Status: {ticket.status}</p>
                </div>
            )}
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
