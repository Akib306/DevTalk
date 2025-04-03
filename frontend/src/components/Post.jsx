import React, { useState } from 'react';
import { Card, Button, Textarea } from '@heroui/react';
import Reply from './Reply';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/apiUtils';
import { formatDate } from '../utils/dateUtils';

const Post = ({ post, onReply, onPostDeleted }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(true); // Initially show replies
    const [replyContent, setReplyContent] = useState('');
    const [image, setImage] = useState(null);
    const [upvotes, setUpvotes] = useState(post.upvotes || 0);
    const [downvotes, setDownvotes] = useState(post.downvotes || 0);
    const [userRating, setUserRating] = useState(post.userRating);
    const { user } = useAuth();
    const isAdmin = user && user.role === 'admin';
    const fileInputRef = React.useRef(null);
    
    const hasReplies = post.replies && post.replies.length > 0;
    
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
            const replyData = {
                post_id: post.id,
                parent_reply_id: null, // parentReplyId is null for direct post replies
                content: replyContent
            };
            
            // Add image if present
            if (image) {
                replyData.image = image;
            }
            
            await onReply(post.id, null, replyContent, image);
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

    const handleDeletePost = async () => {
        if (confirm('Are you sure you want to delete this post and all its replies? This action cannot be undone.')) {
            try {
                const response = await apiRequest(`http://localhost:3000/api/posts/${post.id}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    // Notify parent component to refresh posts
                    if (onPostDeleted) {
                        onPostDeleted();
                    }
                } else {
                    console.error('Failed to delete post:', await response.json());
                    alert('Failed to delete post. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('An error occurred while deleting the post.');
            }
        }
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
                <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400">
                        {formatDate(post.created_at)}
                    </div>
                    {isAdmin && (
                        <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="ghost"
                            onClick={handleDeletePost}
                        >
                            <DeleteIcon />
                        </Button>
                    )}
                </div>
            </div>
            
            {/* Post content */}
            <div className="text-lg mb-4">{post.content}</div>
            
            {/* Post image (if any) */}
            {post.image_url && (
                <div className="mb-4">
                    <img 
                        src={`http://localhost:3000${post.image_url}`} 
                        alt="Post image" 
                        className="max-h-96 rounded-lg border border-gray-700"
                    />
                </div>
            )}
            
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
                            <span className="text-gray-400 text-xs ml-2">Max size: 5MB</span>
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
            
            {/* Render replies */}
            {showReplies && hasReplies && (
                <div className="mt-4 border-t border-gray-700 pt-3">
                    {post.replies.map(reply => (
                        <Reply 
                            key={reply.id} 
                            reply={reply} 
                            onReply={onReply}
                            postId={post.id}
                            onReplyDeleted={onPostDeleted}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
};

export default Post; 