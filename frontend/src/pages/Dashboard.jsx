import { useState } from 'react';
import Navbar from '../components/Navbar';
import ChannelList from '../components/ChannelList';
import ChannelContent from '../components/ChannelContent';
import Footer from '../components/Footer';

const Dashboard = ({ serverChannels }) => {
    const [activeChannel, setActiveChannel] = useState(null);

    const handleChannelClick = (channel) => {
        setActiveChannel(channel);
    };

    const handleBack = () => {
        setActiveChannel(null);
    };

    return (
        <div className="relative h-screen">
            <Navbar />
            {/* Padding at top for the fixed navbar and bottom for the fixed footer */}
            <div className="pt-[100px] pb-[100px] h-full flex">
                {/* Channel list container with its own scrollbar */}
                <div className="w-1/5 border-r border-gray-700 overflow-y-auto p-4">
                    <ChannelList channels={serverChannels} onChannelClick={handleChannelClick} />
                </div>
                {/* Main content container for channel content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeChannel ? (
                        <ChannelContent channel={activeChannel} onBack={handleBack} />
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            Select a channel to view content
                        </div>
                    )}
                </div>
            </div>
            {/* Fixed Footer */}
            <div className="fixed bottom-0 left-0 right-0">
                <Footer />
            </div>
        </div>
);
};

export default Dashboard;
