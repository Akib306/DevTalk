import React from 'react';

const ChannelList = ({ channels = [], onChannelClick }) => {
    return (
        <div className="flex-1 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Server Channels</h1>
        <ul className="space-y-2">
            {channels?.map((channel) => (
                <li 
                    key={channel.id} 
                    className="p-2 hover:bg-gray-700 cursor-pointer rounded"
                    onClick={() => onChannelClick(channel)}
                >
                    {channel.name}
                </li>
            ))}
        </ul>
        </div>
    );
};

export default ChannelList;
