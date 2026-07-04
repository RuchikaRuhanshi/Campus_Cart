/**
 * @file upload.controller.js
 * @description Media asset uploader controller integrated with Cloudinary services.
 */
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Ensure local uploads directory exists
const localUploadsDir = 'uploads';
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// Configure Local Disk Storage
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

let storage;
const useCloudinary = !!process.env.CLOUDINARY_URL;

if (useCloudinary) {
  // Configure Cloudinary (Explicit parse for robustness)
  const matches = process.env.CLOUDINARY_URL.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (matches) {
    cloudinary.config({
      cloud_name: matches[3],
      api_key: matches[1],
      api_secret: matches[2]
    });
  }
  
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'campus_mart_uploads',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
  });
} else {
  storage = diskStorage;
}

// Init Upload
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).array('images', 5);

const uploadImages = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(400).json({ success: false, message: err.message });
    } else {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No file selected' });
      } else {
        const fileUrls = req.files.map(file => {
          if (useCloudinary) {
            return file.path;
          } else {
            const protocol = req.protocol;
            const host = req.get('host');
            // Normalize path to use forward slashes
            const filename = file.filename;
            return `${protocol}://${host}/uploads/${filename}`;
          }
        });
        
        return res.status(200).json({
          success: true,
          message: 'Files uploaded!',
          data: fileUrls
        });
      }
    }
  });
};

export { uploadImages };
 