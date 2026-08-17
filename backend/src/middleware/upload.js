const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'civicalert/reports',
    resource_type: 'auto', // handles both image and video
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov', 'webm'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = upload;
