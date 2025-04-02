import React, { useState } from 'react';
import { Button, Textarea, Card } from '@heroui/react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiRequest } from '../utils/apiUtils';

const Reply = ({ reply, depth = 0, onReply, postId, onReplyDeleted, isAdmin }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [upvotes, setUpvotes] = useState(reply.upvotes || 0);
    const [downvotes, setDownvotes] = useState(reply.downvotes || 0);
    const [userRating, setUserRating] = useState(reply.userRating);
    
    const maxDepth = 5; // Maximum visual nesting depth before horizontal scrolling
    const hasReplies = reply.replies && reply.replies.length > 0;
    
    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        
        await onReply(postId, reply.id, replyContent);
        setReplyContent('');
        setIsReplying(false);
        setShowReplies(true); // Automatically show replies after posting
    };
    
    const handleDeleteReply = async () => {
        if (confirm('Are you sure you want to delete this reply and all its nested replies? This action cannot be undone.')) {
            try {
                const response = await apiRequest(`http://localhost:3000/api/posts/reply/${reply.id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    // Notify parent component to refresh posts
                    if (onReplyDeleted) {
                        onReplyDeleted();
                    }
                } else {
                    console.error('Failed to delete reply:', await response.json());
                    alert('Failed to delete reply. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting reply:', error);
                alert('An error occurred while deleting the reply.');
            }
        }
    };
    
    const handleRate = async (rating) => {
        try {
            // If user clicks the same rating again, they're removing their vote
            const newRating = userRating === rating ? null : rating;
            
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/posts/reply/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reply_id: reply.id,
                    rating: newRating
                })
            });
            
            if (response.ok) {
                // Update local state based on the vote change
                if (userRating === 'up' && newRating !== 'up') {
                    setUpvotes(prev => Math.max(0, prev - 1));
                }
                if (userRating === 'down' && newRating !== 'down') {
                    setDownvotes(prev => Math.max(0, prev - 1));
                }
                if (newRating === 'up' && userRating !== 'up') {
                    setUpvotes(prev => prev + 1);
                    if (userRating === 'down') {
                        setDownvotes(prev => Math.max(0, prev - 1));
                    }
                }
                if (newRating === 'down' && userRating !== 'down') {
                    setDownvotes(prev => prev + 1);
                    if (userRating === 'up') {
                        setUpvotes(prev => Math.max(0, prev - 1));
                    }
                }
                
                setUserRating(newRating);
            } else {
                console.error('Error rating reply:', await response.json());
            }
        } catch (error) {
            console.error('Error rating reply:', error);
        }
    };
    
    return (
        <div className={`reply-container ${depth > 0 ? 'mt-2' : 'mt-4'}`}>
            <Card 
                className={`p-3 border border-gray-700 bg-gray-800/30 ${depth > 0 ? 'ml-4' : ''}`}
                style={{ marginLeft: depth > maxDepth ? `${maxDepth * 16}px` : `${depth * 16}px` }}
            >
                <div className="flex justify-between">
                    <div className="font-medium text-sm text-blue-400">{reply.author_name}</div>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-400">
                            {new Date(reply.created_at).toLocaleString()}
                        </div>
                        {isAdmin && (
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="ghost"
                                onClick={handleDeleteReply}
                            >
                                <DeleteIcon style={{ fontSize: '1rem' }} />
                            </Button>
                        )}
                    </div>
                </div>
                <div className="my-2">{reply.content}</div>
                <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            color="primary"
                            onPress={() => setIsReplying(!isReplying)}
                        >
                            Reply
                        </Button>
                        
                        {hasReplies && (
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                color="default"
                                onPress={() => setShowReplies(!showReplies)}
                            >
                                {showReplies ? `Hide Replies (${reply.replies.length})` : `Show Replies (${reply.replies.length})`}
                            </Button>
                        )}
                    </div>
                    
                    {/* Voting buttons */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light"
                                onPress={() => handleRate('up')}
                                className={userRating === 'up' ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}
                            >
                                <ArrowCircleUpIcon style={{ fontSize: '1rem' }} />
                            </Button>
                            <span className="text-xs">{upvotes}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light"
                                onPress={() => handleRate('down')}
                                className={userRating === 'down' ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
                            >
                                <ArrowCircleDownIcon style={{ fontSize: '1rem' }} />
                            </Button>
                            <span className="text-xs">{downvotes}</span>
                        </div>
                    </div>
                </div>
                
                {isReplying && (
                    <div className="mt-3">
                        <Textarea
                            size="sm"
                            placeholder="Write your reply..."
                            value={replyContent}
                            onValueChange={setReplyContent}
                            minRows={2}
                            maxRows={4}
                            className="w-full"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                color="danger"
                                onPress={() => {
                                    setIsReplying(false);
                                    setReplyContent('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                size="sm" 
                                color="primary"
                                onPress={handleReplySubmit}
                                isDisabled={!replyContent.trim()}
                            >
                                Post Reply
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
            
            {/* Render nested replies with increased depth */}
            {showReplies && hasReplies && (
                <div className={depth > maxDepth ? 'overflow-x-auto' : ''}>
                    {reply.replies.map(nestedReply => (
                        <Reply 
                            key={nestedReply.id} 
                            reply={nestedReply} 
                            depth={depth + 1}
                            onReply={onReply}
                            postId={postId}
                            onReplyDeleted={onReplyDeleted}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reply; 