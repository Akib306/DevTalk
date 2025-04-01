import React from 'react';
import { Button } from '@heroui/react';

const ChannelContent = ({ channel, onBack }) => {
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
                <Button color="primary" variant="shadow" size="md">
                    Create New Post
                </Button>
                <Button onClick={onBack} variant="ghost" size="md">
                    &larr; Back to Channels
                </Button>
            </div>
            
            {/* Render channel messages or content here */}
            <div className="flex-1 overflow-y-auto">
                {/* Channel messages would be mapped here */}
                {channel.messages && channel.messages.map((msg) => (
                <div key={msg.id} className="mb-4">
                    <p className="font-semibold">{msg.authorName}</p>
                    <p>{msg.content}</p>
                </div>
                ))}
            </div>
        </div>
    );
};

export default ChannelContent;
