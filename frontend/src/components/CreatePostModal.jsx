import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Form } from '@heroui/react';
import { apiRequest } from '../utils/apiUtils';

const CreatePostModal = ({ isOpen, onClose, channelId, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validatePost = (text) => {
        const errors = [];
        if (!text.trim()) {
            errors.push("Post content is required");
        }
        if (text.length > 2000) {
            errors.push("Post content must be 2000 characters or less");
        }
        return errors;
    };

    const handleCreatePost = async () => {
        const postErrors = validatePost(content);
        
        if (postErrors.length > 0) {
            setErrors({ content: postErrors.join(" ") });
            return;
        }
        
        try {
            setIsLoading(true);
            const response = await apiRequest('http://localhost:3000/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    channel_id: channelId,
                    content
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                setContent('');
                setErrors({});
                onClose();
                
                // Call the callback to refresh posts
                if (onPostCreated) {
                    onPostCreated();
                }
            } else {
                const errorData = await response.json();
                console.error('Error creating post:', errorData);
                setErrors({ global: errorData.message || 'Failed to create post.' });
            }
        } catch (error) {
            console.error('Error creating post:', error);
            setErrors({ global: 'Error creating post.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setContent('');
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50 w-[450px]">
                <ModalHeader className="text-2xl font-bold text-center text-white">
                    Create New Post
                </ModalHeader>
                <ModalBody>
                    {errors.global && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-500 text-center">
                            {errors.global}
                        </div>
                    )}
                    <Form validationErrors={errors}>
                        <Textarea
                            isRequired
                            size="lg"
                            label="Post Content"
                            labelPlacement="outside"
                            placeholder="What's on your mind?"
                            value={content}
                            onValueChange={setContent}
                            errorMessage={errors.content}
                            isInvalid={!!errors.content}
                            minRows={4}
                            maxRows={8}
                            className="w-full"
                        />
                        <p className="text-gray-400 text-sm mt-1">Character limit: 2000</p>
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="ghost" onPress={handleClose} isDisabled={isLoading}>
                        Cancel
                    </Button>
                    <Button color="primary" onPress={handleCreatePost} isLoading={isLoading}>
                        Post
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CreatePostModal; 