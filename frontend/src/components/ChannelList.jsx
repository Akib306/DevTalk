import React from 'react';
import { Button } from '@heroui/react';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/apiUtils';

const ChannelList = ({ channels = [], onChannelClick, onChannelDeleted, activeChannel }) => {
    const { user } = useAuth();
    const isAdmin = user && user.role === 'admin';

    const handleDeleteChannel = async (e, channelId) => {
        e.stopPropagation(); // Prevent channel click event
        
        if (confirm('Are you sure you want to delete this channel? This action cannot be undone.')) {
            try {
                const response = await apiRequest(`http://localhost:3000/api/channels/${channelId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    // Notify parent component to refresh the channels list
                    if (onChannelDeleted) {
                        // Pass the deleted channel id so Dashboard can clear active channel if needed
                        onChannelDeleted(channelId);
                    }
                } else {
                    console.error('Failed to delete channel:', await response.json());
                    alert('Failed to delete channel. Please try again.');
                }
            } catch (error) {
                console.error('Error deleting channel:', error);
                alert('An error occurred while deleting the channel.');
            }
        }
    };

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="my-2 border-b border-gray-700">
                <h1 className="text-2xl font-bold mb-4">Server Channels</h1>
            </div>
            
            <ul className="space-y-1">
                {channels?.map((channel) => (
                    <li 
                        key={channel.id} 
                        className={`p-2 hover:bg-gray-700 cursor-pointer rounded group relative ${activeChannel && activeChannel.id === channel.id ? 'bg-gray-700' : ''}`}
                        onClick={() => onChannelClick(channel)}
                        title={channel.creator_name ? `Created by ${channel.creator_name}` : ''}
                    >
                        <div className="flex justify-between items-center">
                            <span>{channel.name}</span>
                            <div className="flex items-center gap-2">
                                {channel.creator_name && (
                                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        by {channel.creator_name}
                                    </span>
                                )}
                                {isAdmin && (
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        color="danger"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => handleDeleteChannel(e, channel.id)}
                                    >
                                        <DeleteIcon />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChannelList;
