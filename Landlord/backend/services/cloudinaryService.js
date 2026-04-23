const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require('path');

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder path (e.g., 'rooms/images')
 * @param {Object} options - Additional options
 * @returns {Promise} - Returns {secure_url, public_id}
 */
async function uploadImage(fileBuffer, folder = 'rooms/images', options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        overwrite: false,
        ...options
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            url: result.secure_url
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
}

/**
 * Upload document file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} documentType - Document type (contract, receipt, etc.)
 * @param {Object} options - Additional options
 * @returns {Promise} - Returns {secure_url, public_id}
 */
async function uploadDocument(fileBuffer, documentType = 'documents', options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `rooms/${documentType}`,
        resource_type: 'auto',
        overwrite: false,
        ...options
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            url: result.secure_url,
            bytes: result.bytes,
            format: result.format
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
}

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - Type of resource ('image', 'video', 'raw', etc.)
 * @returns {Promise}
 */
async function deleteFile(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file from Cloudinary: ${error.message}`);
  }
}

/**
 * Get file info from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise}
 */
async function getFileInfo(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to get file info from Cloudinary: ${error.message}`);
  }
}

/**
 * Upload multiple images
 * @param {Array} files - Array of file buffers or Express multer files
 * @param {String} folder - Cloudinary folder path
 * @returns {Promise} - Array of {secure_url, public_id}
 */
async function uploadMultipleImages(files, folder = 'rooms/images') {
  try {
    const uploadPromises = files.map(file => {
      const fileBuffer = file.buffer || Buffer.from(file);
      return uploadImage(fileBuffer, folder);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
}

/**
 * Validate file before upload
 * @param {Object} file - Multer file object
 * @param {Object} options - Validation options
 * @returns {Boolean}
 */
function validateFile(file, options = {}) {
  const {
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    maxFileSize = 10 * 1024 * 1024 // 10MB default
  } = options;

  if (!file) {
    throw new Error('No file provided');
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} is not allowed`);
  }

  if (file.size > maxFileSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`);
  }

  return true;
}

module.exports = {
  uploadImage,
  uploadDocument,
  deleteFile,
  getFileInfo,
  uploadMultipleImages,
  validateFile
};
