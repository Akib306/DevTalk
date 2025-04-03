import React, { useState, useRef } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Textarea, Form } from '@heroui/react';
import { apiRequest } from '../utils/apiUtils';
import ImageIcon from '@mui/icons-material/Image';

const CreatePostModal = ({ isOpen, onClose, channelId, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            setErrors({ image: "Please select an image file (png, jpg, jpeg, gif)" });
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setErrors({ image: "Image size must be less than 5MB" });
            return;
        }

        // Read the file and convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            setImage(e.target.result);
            setErrors((prev) => ({ ...prev, image: null }));
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCreatePost = async () => {
        const postErrors = validatePost(content);
        
        if (postErrors.length > 0) {
            setErrors({ content: postErrors.join(" ") });
            return;
        }
        
        try {
            setIsLoading(true);
            
            const postData = { 
                channel_id: channelId,
                content
            };
            
            // Add image if present
            if (image) {
                postData.image = image;
            }
            
            const response = await apiRequest('http://localhost:3000/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
            
            if (response.ok) {
                const data = await response.json();
                setContent('');
                setImage(null);
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
        setImage(null);
        setErrors({});
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <ModalContent className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50 w-[500px]">
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
                        
                        {/* Image upload section */}
                        <div className="mt-4">
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        ref={fileInputRef}
                                    />
                                    <Button
                                        startContent={<ImageIcon />}
                                        color="secondary"
                                        variant="ghost"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        Add Image
                                    </Button>
                                </div>
                                {errors.image && (
                                    <div className="text-red-500 text-sm">{errors.image}</div>
                                )}
                                <div className="text-gray-400 text-sm">Max size: 5MB</div>
                            </div>
                            
                            {/* Preview the image */}
                            {image && (
                                <div className="mt-3 relative">
                                    <img 
                                        src={image} 
                                        alt="Preview" 
                                        className="max-h-64 rounded-lg border border-gray-700"
                                    />
                                    <Button 
                                        size="sm"
                                        color="danger"
                                        variant="ghost"
                                        className="absolute top-2 right-2"
                                        onPress={handleRemoveImage}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>
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