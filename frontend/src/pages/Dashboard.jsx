import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ChannelList from '../components/ChannelList';
import ChannelContent from '../components/ChannelContent';

const Dashboard = ({ userChannels, serverChannels }) => {
    // activeChannel is null when no channel is selected
    const [activeChannel, setActiveChannel] = useState(null);

    const handleChannelClick = (channel) => {
        setActiveChannel(channel);
    };

    const handleBack = () => {
        // To go back to the channel list view
        setActiveChannel(null);
    };

    return (
        <div className="flex h-screen">
        {/* Sidebar: DevTalk logo and user-created channels */}
        <Sidebar userChannels={userChannels} />

        <div className="flex flex-col flex-1">
            {/* Navbar: search bar and user account avatar */}
            <Navbar />

            <div className="flex-1 overflow-auto p-4">
            {activeChannel ? (
                // Render channel content view
                <ChannelContent channel={activeChannel} onBack={handleBack} />
            ) : (
                // Render list of all channels in the server
                <ChannelList channels={serverChannels} onChannelClick={handleChannelClick} />
            )}
            </div>
        </div>
        </div>
    );
};

export default Dashboard;
