import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL, { API_BASE_URL } from '../config';
import './CommentSection.css';

const CommentSection = ({ targetId, targetModel }) => {
    const { user, showAuthModal } = useAuth();
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (targetId && targetModel) {
            fetchComments();
        }
    }, [targetId, targetModel]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`${API_URL}/comments/${targetModel}/${targetId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (err) {
            console.error("Failed to fetch comments", err);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();

        if (!user) {
            showAuthModal('login');
            return;
        }

        if (!newCommentText.trim()) return;

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    targetId,
                    targetModel,
                    text: newCommentText
                })
            });

            if (res.ok) {
                const newComment = await res.json();
                setComments([newComment, ...comments]); // Prepend new comment to UI instantly
                setNewCommentText('');
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Failed to post comment.");
            }
        } catch (err) {
            console.error("Failed to post comment", err);
            alert("Network error.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });

            if (res.ok) {
                setComments(comments.filter(c => c._id !== commentId));
            } else {
                alert("Failed to delete comment.");
            }
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/50';
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_BASE_URL}${imagePath}`;
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="comment-section">
            <h3 className="comment-header">Discussion ({comments.length})</h3>

            {/* Post Comment Input Box */}
            <div className="comment-input-area">
                {!user ? (
                    <div className="login-prompt" onClick={() => showAuthModal('login')}>
                        <p>Sign in to join the conversation!</p>
                        <button className="btn-login-small">Login</button>
                    </div>
                ) : (
                    <form onSubmit={handlePostComment} className="comment-form">
                        <img src={getImageUrl(user.image)} alt="User" className="comment-avatar" />
                        <div className="comment-input-wrapper">
                            <textarea
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                rows="2"
                                required
                            />
                            <button type="submit" disabled={isLoading || !newCommentText.trim()}>
                                {isLoading ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Display Comments List */}
            <div className="comments-list">
                {comments.map((comment) => (
                    <div key={comment._id} className="comment-item">
                        <img
                            src={getImageUrl(comment.user?.image)}
                            alt={comment.user?.name || "Deleted User"}
                            className="comment-avatar"
                        />
                        <div className="comment-content">
                            <div className="comment-meta">
                                <span className="comment-author">
                                    {comment.user?.name || "Deleted User"}
                                    {comment.user?.role === 'admin' && <span className="admin-badge">Admin</span>}
                                </span>
                                <span className="comment-date">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="comment-text">{comment.text}</p>

                            {user && (user.id === comment.user?._id || user.role === 'admin') && (
                                <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="delete-comment-btn"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
