import React from 'react';

const ChannelList = ({ channels = [], onChannelClick }) => {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="my-2 border-b border-gray-700">
                <h1 className="text-2xl font-bold mb-4">Server Channels</h1>
            </div>
            
            <ul className="space-y-1">
                {channels?.map((channel) => (
                    <li 
                        key={channel.id} 
                        className="p-2 hover:bg-gray-700 cursor-pointer rounded group relative"
                        onClick={() => onChannelClick(channel)}
                        title={channel.creator_name ? `Created by ${channel.creator_name}` : ''}
                    >
                        <div className="flex justify-between items-center">
                            <span>{channel.name}</span>
                            {channel.creator_name && (
                                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    by {channel.creator_name}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ChannelList;
