import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ChannelList from '../components/ChannelList';
import ChannelContent from '../components/ChannelContent';
import { Button, Form, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import Footer from '../components/Footer';
import { apiRequest } from '../utils/apiUtils';

const Dashboard = () => {
    const [activeChannel, setActiveChannel] = useState(null);
    const [channels, setChannels] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // Fetch channels on component mount
    useEffect(() => {
        fetchChannels();
        
        // Add event listener for user deletion
        const handleUserDeleted = () => {
            console.log('User deleted event detected, refreshing channels');
            fetchChannels();
            
            // If we have an active channel and its content might have changed, reset it
            if (activeChannel) {
                setActiveChannel(null);
            }
        };
        
        // Add event listener
        window.addEventListener('userDeleted', handleUserDeleted);
        
        // Clean up event listener
        return () => {
            window.removeEventListener('userDeleted', handleUserDeleted);
        };
    }, [activeChannel]);

    const fetchChannels = async () => {
        try {
            setIsLoading(true);
            const response = await apiRequest('http://localhost:3000/api/channels');
            
            if (response.ok) {
                const data = await response.json();
                setChannels(data);
            } else {
                console.error('Error fetching channels:', await response.json());
            }
        } catch (error) {
            console.error('Error fetching channels:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChannelClick = (channel) => {
        setActiveChannel(channel);
    };

    const handleBack = () => {
        setActiveChannel(null);
    };

    const validateChannelName = (name) => {
        const errors = [];
        if (!name) {
            errors.push("Channel name is required.");
        }
        if (name.length > 20) {
            errors.push("Channel name must be 20 characters or less.");
        }
        return errors;
    };

    const handleCreateChannel = async () => {
        const channelErrors = validateChannelName(channelName);
        
        if (channelErrors.length > 0) {
            setErrors({ name: channelErrors.join(" ") });
            return;
        }
        
        try {
            const response = await apiRequest('http://localhost:3000/api/channels', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: channelName })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Get username from localStorage or JWT decode if available
                const username = localStorage.getItem('username') || 'You';

                const newChannel = { 
                    id: data.channel_id, 
                    name: channelName,
                    creator_name: username // Add creator name
                };
                setChannels([...channels, newChannel]);
                setIsModalOpen(false);
                setChannelName("");
                setErrors({});
            } else {
                const errorData = await response.json();
                console.error('Error creating channel:', errorData);
                setErrors({ global: errorData.message || 'Failed to create channel.' });
            }
        } catch (error) {
            console.error('Error creating channel:', error);
            setErrors({ global: 'Error creating channel.' });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setChannelName("");
        setErrors({});
    };

    return (
        <div className="relative h-screen">
            <Navbar />
            {/* Padding at top for the fixed navbar and bottom for the fixed footer */}
            <div className="pt-[100px] pb-[100px] h-full flex">
                {/* Channel list container with its own scrollbar */}
                <div className="w-1/5 border-r border-gray-700 overflow-y-auto p-4 ml-6">
                    
                    <Button 
                        onPress={() => setIsModalOpen(true)}
                        color="primary" 
                        size="md" 
                        variant="shadow"
                    >
                        Create New Channel
                    </Button>
                    
                    {isLoading ? (
                        <p>Loading channels...</p>
                    ) : (
                        <ChannelList channels={channels} onChannelClick={handleChannelClick} />
                    )}
                    
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

            {/* Channel Creation Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <ModalContent className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50 w-[350px]">
                <ModalHeader className="text-2xl font-bold text-center text-white">
                    Create New Channel
                </ModalHeader>
                <ModalBody>
                    {errors.global && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-500 text-center">
                        {errors.global}
                    </div>
                    )}
                    <Form validationErrors={errors} onReset={closeModal}>
                        <Input
                            isRequired
                            size="lg"
                            label="Channel Name"
                            labelPlacement="outside"
                            name="name"
                            placeholder="Enter channel name"
                            value={channelName}
                            onValueChange={setChannelName}
                            errorMessage={errors.name}
                            isInvalid={!!errors.name}
                            maxLength={20}
                            className="w-full"
                        />
                        <p className="text-gray-400 text-sm mt-1">Character limit: 20</p>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="ghost" onPress={closeModal}>
                        Cancel
                    </Button>
                    <Button color="primary" onPress={handleCreateChannel}>
                        Create Channel
                    </Button>
                </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default Dashboard;
