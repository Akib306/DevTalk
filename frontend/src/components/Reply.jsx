import React, { useState, useRef } from 'react';
import { Button, Textarea, Card } from '@heroui/react';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { apiRequest } from '../utils/apiUtils';
import { formatDate } from '../utils/dateUtils';

const Reply = ({ reply, depth = 0, onReply, postId, onReplyDeleted, isAdmin }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [image, setImage] = useState(null);
    const [upvotes, setUpvotes] = useState(reply.upvotes || 0);
    const [downvotes, setDownvotes] = useState(reply.downvotes || 0);
    const [userRating, setUserRating] = useState(reply.userRating);
    const fileInputRef = useRef(null);
    
    const maxDepth = 5; // Maximum visual nesting depth before horizontal scrolling
    const hasReplies = reply.replies && reply.replies.length > 0;
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            alert("Please select an image file (png, jpg, jpeg, gif)");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5MB");
            return;
        }

        // Read the file and convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;
        
        try {
            await onReply(postId, reply.id, replyContent, image);
            setReplyContent('');
            setImage(null);
            setIsReplying(false);
            setShowReplies(true); // Automatically show replies after posting
            
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error submitting reply:', error);
        }
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
                    <div className="flex items-center">
                        <div className="font-medium text-sm text-blue-400">{reply.author_name}</div>
                        {reply.authorBadge && (
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                reply.authorBadge === 'Expert' ? 'bg-purple-500 text-white' : 
                                reply.authorBadge === 'Helper' ? 'bg-blue-500 text-white' : 
                                'bg-gray-500 text-white'
                            }`}>
                                {reply.authorBadge}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-400">
                            {formatDate(reply.created_at)}
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
                
                {/* Reply content */}
                <div className="my-2">{reply.content}</div>
                
                {/* Reply image (if any) */}
                {reply.image_url && (
                    <div className="mb-2">
                        <img 
                            src={`http://localhost:3000${reply.image_url}`} 
                            alt="Reply image" 
                            className="max-h-64 rounded-lg border border-gray-700"
                        />
                    </div>
                )}
                
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
                        
                        {/* Image upload for reply */}
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    ref={fileInputRef}
                                />
                                <Button
                                    size="sm"
                                    startContent={<ImageIcon />}
                                    color="secondary"
                                    variant="ghost"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    Add Image
                                </Button>
                                <span className="text-gray-400 text-xs">Max size: 5MB</span>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    color="danger"
                                    onPress={() => {
                                        setIsReplying(false);
                                        setReplyContent('');
                                        setImage(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
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
                        
                        {/* Image preview */}
                        {image && (
                            <div className="mt-3 relative">
                                <img 
                                    src={image} 
                                    alt="Preview" 
                                    className="max-h-64 rounded-lg border border-gray-700"
                                />
                                <Button 
                                    size="sm"
                                    color="danger"
                                    variant="ghost"
                                    className="absolute top-2 right-2"
                                    onPress={handleRemoveImage}
                                >
                                    Remove Image
                                </Button>
                            </div>
                        )}
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