import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import CreatePostModal from './CreatePostModal';
import Post from './Post';
import { apiRequest } from '../utils/apiUtils';

const ChannelContent = ({ channel, onBack }) => {
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (channel && channel.id) {
            fetchPosts();
        }
    }, [channel]);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await apiRequest(`http://localhost:3000/api/posts/withReplies?channel_id=${channel.id}`);
            
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            } else {
                setError('Failed to load posts');
                console.error('Error fetching posts:', await response.json());
            }
        } catch (error) {
            setError('Error loading posts');
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (postId, parentReplyId, content) => {
        try {
            const response = await apiRequest('http://localhost:3000/api/posts/reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    post_id: postId,
                    parent_reply_id: parentReplyId,
                    content
                })
            });
            
            if (response.ok) {
                // Refresh posts after a successful reply
                await fetchPosts();
            } else {
                console.error('Error posting reply:', await response.json());
            }
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header with back button and channel title on opposite ends */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-left">
                    <h1 className="text-3xl font-bold">{channel.name}</h1>
                    <p className="text-gray-500 text-sm">
                        Created by <span className="font-medium">{channel.creator_name || 'Unknown user'}</span>
                    </p>
                </div>
                <Button 
                    color="primary" 
                    variant="shadow" 
                    size="md"
                    onPress={() => setIsCreatePostModalOpen(true)}
                >
                    Create New Post
                </Button>
                <Button onClick={onBack} variant="ghost" size="md">
                    &larr; Back to Channels
                </Button>
            </div>
            
            {/* Posts section */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <p className="text-gray-400">Loading posts...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-500 p-4 border border-red-500/30 rounded-lg">
                        {error}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center p-8 text-gray-400">
                        <p>No posts in this channel yet.</p>
                        <p>Be the first to create a post!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map(post => (
                            <Post 
                                key={post.id} 
                                post={post} 
                                onReply={handleReply}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            <CreatePostModal 
                isOpen={isCreatePostModalOpen}
                onClose={() => setIsCreatePostModalOpen(false)}
                channelId={channel.id}
                onPostCreated={fetchPosts}
            />
        </div>
    );
};

export default ChannelContent;
