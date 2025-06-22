import React, { useEffect, useState } from 'react';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { useApi } from '../../hooks/useApi';
import { addComment, getComments, updateComment, deleteComment } from '../../services/TicketService';
import CustomFieldset from '../CustomFieldset';
import { useTranslation } from 'react-i18next';

interface Comment {
    id: number;
    comment: string;
    createdAt: string;
}

interface CommentsSectionProps {
    ticketId: number;
}

const timeSince = (dateStr: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
};

const CommentsSection: React.FC<CommentsSectionProps> = ({ ticketId }) => {
    const { apiHandler: commentsApiHandler } = useApi<any>();
    const { apiHandler: addCommentApiHandler } = useApi<any>();
    const { apiHandler: updateCommentApiHandler } = useApi<any>();
    const { apiHandler: deleteCommentApiHandler } = useApi<any>();

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        loadComments(5);
    }, [ticketId]);

    const loadComments = (count?: number) => {
        commentsApiHandler(() => getComments(ticketId)).then((all: any) => {
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
        addCommentApiHandler(() => addComment(ticketId, commentText)).then(() => {
            setCommentText('');
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
            setEditText('');
            loadComments(comments.length);
        });
    };

    const removeComment = (id: number) => {
        deleteCommentApiHandler(() => deleteComment(id)).then(() => {
            loadComments(comments.length);
        });
    };

    const { t } = useTranslation();
    return (
        <CustomFieldset title={t('Comments')} className="mt-4">
            <div className="border p-3 mb-3">
                <textarea
                    className="form-control mb-2"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                />
                <button className="btn btn-primary" onClick={postComment}>{t('Post')}</button>
            </div>
            <div>
                {comments.length === 0 && <p>{t('No comments')}</p>}
                {comments.map((c) => (
                    <div key={c.id} className="border p-2 mb-2">
                        {editingCommentId === c.id ? (
                            <>
                                <textarea
                                    className="form-control mb-2"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                />
                                <button className="btn btn-primary btn-sm me-2" onClick={() => saveEdit(c.id)}>{t('Save')}</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditingCommentId(null)}>{t('Cancel')}</button>
                            </>
                        ) : (
                            <div className="d-flex align-items-start">
                                <div className="flex-grow-1">
                                    <div>{c.comment}</div>
                                    <small className="text-muted">{timeSince(c.createdAt)}</small>
                                </div>
                                <div className="ms-2">
                                    <CustomIconButton icon="Edit" size="small" onClick={() => startEdit(c)} />
                                    <CustomIconButton icon="Delete" size="small" onClick={() => removeComment(c.id)} color="error" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {showMore && (
                    <button className="btn btn-link" onClick={() => loadComments()}>{t('Show more')}</button>
                )}
            </div>
        </CustomFieldset>
    );
};

export default CommentsSection;

