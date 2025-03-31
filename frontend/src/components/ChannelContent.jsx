import React from 'react';

const ChannelContent = ({ channel, onBack }) => {
    return (
        <div>
        {/* Back button to return to channel list */}
        <button onClick={onBack} className="mb-4 text-blue-500">
            &larr; Back to Channels
        </button>
        {/* Channel header with title and creator's name */}
        <div className="mb-6">
            <h1 className="text-3xl font-bold">{channel.name}</h1>
            <p className="text-gray-600">Created by {channel.creatorName}</p>
        </div>
        {/* Render channel messages or content here */}
        <div>
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
