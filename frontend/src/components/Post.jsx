import React, { useState } from 'react';
import { Card, Button, Textarea } from '@heroui/react';
import Reply from './Reply';

const Post = ({ post, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(true); // Initially show replies
    const [replyContent, setReplyContent] = useState('');
    
    const hasReplies = post.replies && post.replies.length > 0;
    
    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        
        await onReply(post.id, null, replyContent); // parentReplyId is null for direct post replies
        setReplyContent('');
        setIsReplying(false);
        setShowReplies(true); // Automatically show replies after posting
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
            
            <div className="flex gap-2 border-t border-gray-700 pt-3">
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