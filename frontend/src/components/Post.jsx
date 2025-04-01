import React, { useState } from 'react';
import { Card, Button, Textarea } from '@heroui/react';
import Reply from './Reply';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';

const Post = ({ post, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(true); // Initially show replies
    const [replyContent, setReplyContent] = useState('');
    const [upvotes, setUpvotes] = useState(post.upvotes || 0);
    const [downvotes, setDownvotes] = useState(post.downvotes || 0);
    const [userRating, setUserRating] = useState(post.userRating);
    
    const hasReplies = post.replies && post.replies.length > 0;
    
    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        
        await onReply(post.id, null, replyContent); // parentReplyId is null for direct post replies
        setReplyContent('');
        setIsReplying(false);
        setShowReplies(true); // Automatically show replies after posting
    };

    const handleRate = async (rating) => {
        try {
            // If user clicks the same rating again, they're removing their vote
            const newRating = userRating === rating ? null : rating;
            
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/posts/rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    post_id: post.id,
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
                console.error('Error rating post:', await response.json());
            }
        } catch (error) {
            console.error('Error rating post:', error);
        }
    };
    
    return (
        <Card className="mb-6 p-4 border border-gray-700 bg-gray-800/50">
            <div className="flex justify-between mb-2">
                <div className="font-semibold text-blue-400">{post.author_name}</div>
                <div className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleString()}
                </div>
            </div>
            
            <div className="text-lg mb-4">{post.content}</div>
            
            <div className="flex items-center justify-between border-t border-gray-700 pt-3">
                <div className="flex gap-2">
                    <Button 
                        size="sm" 
                        color="primary" 
                        variant="ghost"
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
                            {showReplies ? `Hide Replies (${post.replies.length})` : `Show Replies (${post.replies.length})`}
                        </Button>
                    )}
                </div>
                
                {/* Voting buttons */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light" 
                            onPress={() => handleRate('up')}
                            className={userRating === 'up' ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}
                        >
                            <ArrowCircleUpIcon />
                        </Button>
                        <span className="text-sm">{upvotes}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light" 
                            onPress={() => handleRate('down')}
                            className={userRating === 'down' ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
                        >
                            <ArrowCircleDownIcon />
                        </Button>
                        <span className="text-sm">{downvotes}</span>
                    </div>
                </div>
            </div>
            
            {isReplying && (
                <div className="mt-4">
                    <Textarea
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
            
            {/* Render replies */}
            {showReplies && hasReplies && (
                <div className="mt-4 border-t border-gray-700 pt-3">
                    {post.replies.map(reply => (
                        <Reply 
                            key={reply.id} 
                            reply={reply} 
                            onReply={onReply}
                            postId={post.id}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
};

export default Post; 