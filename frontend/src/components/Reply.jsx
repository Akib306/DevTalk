import React, { useState } from 'react';
import { Button, Textarea, Card } from '@heroui/react';

const Reply = ({ reply, depth = 0, onReply, postId }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    
    const maxDepth = 5; // Maximum visual nesting depth before horizontal scrolling
    const hasReplies = reply.replies && reply.replies.length > 0;
    
    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        
        await onReply(postId, reply.id, replyContent);
        setReplyContent('');
        setIsReplying(false);
        setShowReplies(true); // Automatically show replies after posting
    };
    
    return (
        <div className={`reply-container ${depth > 0 ? 'mt-2' : 'mt-4'}`}>
            <Card 
                className={`p-3 border border-gray-700 bg-gray-800/30 ${depth > 0 ? 'ml-4' : ''}`}
                style={{ marginLeft: depth > maxDepth ? `${maxDepth * 16}px` : `${depth * 16}px` }}
            >
                <div className="flex justify-between">
                    <div className="font-medium text-sm text-blue-400">{reply.author_name}</div>
                    <div className="text-xs text-gray-400">
                        {new Date(reply.created_at).toLocaleString()}
                    </div>
                </div>
                <div className="my-2">{reply.content}</div>
                <div className="flex gap-2 mt-2">
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Reply; 