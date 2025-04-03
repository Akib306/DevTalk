import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_FOLDER = path.join(__dirname, '../../uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

/**
 * Saves a base64 encoded image to the uploads folder
 * @param {string} base64Image - The base64 encoded image data
 * @returns {string|null} - The URL of the saved image or null if error
 */
export const saveImage = (base64Image) => {
    try {
        // Check if the input is actually a base64 image
        if (!base64Image || !base64Image.includes('base64')) {
            return null;
        }

        // Extract the image type and data
        const matches = base64Image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return null;
        }

        const imageType = matches[1];
        const imageData = matches[2];
        const buffer = Buffer.from(imageData, 'base64');

        // Check file size (5MB limit)
        const fileSizeInBytes = buffer.length;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
        if (fileSizeInMB > 5) {
            return null;
        }

        // Generate a unique filename
        const filename = `${crypto.randomBytes(16).toString('hex')}.${imageType}`;
        const filePath = path.join(UPLOADS_FOLDER, filename);

        // Save the file
        fs.writeFileSync(filePath, buffer);

        // Return the URL path to the image
        return `/uploads/${filename}`;
    } catch (error) {
        console.error('Error saving image:', error);
        return null;
    }
};

/**
 * Validates image size from base64 string
 * @param {string} base64Image - The base64 encoded image data
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateImageSize = (base64Image) => {
    if (!base64Image || !base64Image.includes('base64')) {
        return false;
    }

    const matches = base64Image.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return false;
    }

    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');
    
    // Check file size (5MB limit)
    const fileSizeInBytes = buffer.length;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    
    return fileSizeInMB <= 5;
};

/**
 * Deletes an image file from the uploads directory
 * @param {string} imageUrl - The URL path of the image to delete (e.g., /uploads/filename.jpg)
 * @returns {boolean} - True if deletion was successful, false otherwise
 */
export const deleteImage = (imageUrl) => {
    try {
        // If no image URL is provided, just return true
        if (!imageUrl) return true;
        
        // Make sure the URL starts with /uploads/ to prevent directory traversal
        if (!imageUrl.startsWith('/uploads/')) {
            console.error('Invalid image URL format:', imageUrl);
            return false;
        }
        
        // Get just the filename from the URL
        const filename = path.basename(imageUrl);
        const filePath = path.join(UPLOADS_FOLDER, filename);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.warn('Image file not found:', filePath);
            return false;
        }
        
        // Delete the file
        fs.unlinkSync(filePath);
        console.log('Image file deleted:', filePath);
        return true;
    } catch (error) {
        console.error('Error deleting image file:', error);
        return false;
    }
}; 