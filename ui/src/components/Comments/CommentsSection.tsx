import React, { useEffect, useState } from 'react';
import CustomIconButton from '../UI/IconButton/CustomIconButton';
import { useApi } from '../../hooks/useApi';
import { addComment, getComments, updateComment, deleteComment } from '../../services/TicketService';
import CustomFieldset from '../CustomFieldset';
import { useTranslation } from 'react-i18next';
import { getCurrentUserDetails } from '../../config/config';
import { getUserDetails } from '../../services/UserService';

export interface CreateComment {
    comment: string;
    createdBy: string;
    updatedBy: string;
}

export interface Comment {
    id: string
    ticketId: string
    comment: string;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    createdByUsername?: string;
    createdByName?: string;
}

interface CommentAuthorDetails {
    username?: string;
    name?: string;
}

interface CommentsSectionProps {
    ticketId: string;
    allowCommenting?: boolean;
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

const CommentsSection: React.FC<CommentsSectionProps> = ({ ticketId, allowCommenting = true }) => {
    const { apiHandler: commentsApiHandler } = useApi<any>();
    const { apiHandler: addCommentApiHandler } = useApi<any>();
    const { apiHandler: updateCommentApiHandler } = useApi<any>();
    const { apiHandler: deleteCommentApiHandler } = useApi<any>();
    const currentUserId = getCurrentUserDetails()?.userId;

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [showMore, setShowMore] = useState(false);
    const [commentAuthorsById, setCommentAuthorsById] = useState<Record<string, CommentAuthorDetails>>({});

    useEffect(() => {
        loadComments(5);
    }, [ticketId]);

    const loadComments = (count?: number) => {
        commentsApiHandler(() => getComments(ticketId)).then((all: any) => {
            if (count && all?.length > count) {
                setComments(all.slice(0, count));
                setShowMore(true);
                loadCommentAuthors(all.slice(0, count));
            } else {
                setComments(all);
                setShowMore(false);
                loadCommentAuthors(all ?? []);
            }
        });
    };

    const loadCommentAuthors = (items: Comment[]) => {
        const missingAuthorIds = Array.from(new Set(items
            .map((item) => item.createdBy)
            .filter((createdBy): createdBy is string => Boolean(createdBy) && !commentAuthorsById[createdBy])));

        if (missingAuthorIds.length === 0) {
            return;
        }

        Promise.all(missingAuthorIds.map(async (authorId) => {
            const user = await getUserDetails(authorId);
            const payload = user?.data ?? user;
            return {
                authorId,
                username: payload?.username,
                name: payload?.name,
            };
        })).then((authors) => {
            setCommentAuthorsById((prev) => {
                const next = { ...prev };
                authors.forEach(({ authorId, username, name }) => {
                    next[authorId] = { username, name };
                });
                return next;
            });
        }).catch(() => {
            // Keep comment list functional even when author lookup fails.
        });
    };

    const postComment = () => {
        if (!commentText || !currentUserId) return;
        let payload: CreateComment = {
            comment: commentText,
            createdBy: currentUserId,
            updatedBy: currentUserId
        }
        addCommentApiHandler(() => addComment(ticketId, payload)).then(() => {
            setCommentText('');
            loadComments();
        });
    };

    const startEdit = (c: Comment) => {
        setEditingCommentId(c.id);
        setEditText(c.comment);
    };

    const saveEdit = (id: string) => {
        updateCommentApiHandler(() => updateComment(id, editText)).then(() => {
            setEditingCommentId(null);
            setEditText('');
            loadComments(comments?.length);
        });
    };

    const removeComment = (id: string) => {
        deleteCommentApiHandler(() => deleteComment(id)).then(() => {
            loadComments(comments?.length);
        });
    };

    const { t } = useTranslation();
    return (
        <>
            {allowCommenting && (
                <div className="border p-3 mb-3">
                    <textarea
                        className="form-control mb-2"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={postComment}>{t('Post')}</button>
                </div>
            )}
            <div>
                {comments?.length === 0 && <p>{t('No comments')}</p>}
                {comments?.map((c) => (
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
                                    <small className="text-muted d-block">
                                        {(() => {
                                            const author = commentAuthorsById[c.createdBy] ?? {};
                                            const username = c.createdByUsername ?? author.username ?? c.createdBy;
                                            const name = c.createdByName ?? author.name;
                                            if (name && username) return `${username} (${name})`;
                                            return username || t('Unknown user');
                                        })()}
                                    </small>
                                    <small className="text-muted">{timeSince(c.createdAt)}</small>
                                </div>
                                {allowCommenting && c.createdBy && currentUserId && c.createdBy.toLowerCase() === currentUserId.toLowerCase() && (
                                    <div className="ms-2">
                                        <CustomIconButton icon="edit" size="small" onClick={() => startEdit(c)} />
                                        <CustomIconButton icon="delete" size="small" onClick={() => removeComment(c.id)} color="error" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {showMore && (
                    <button className="btn btn-link" onClick={() => loadComments()}>{t('Show more')}</button>
                )}
            </div>
        </>
    );
};

export default CommentsSection;
