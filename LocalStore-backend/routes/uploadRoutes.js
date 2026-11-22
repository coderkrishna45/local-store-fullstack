const express = require('express');
const router = express.Router();
const { upload, uploadProductImage } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, (req, res, next) => {
  if (!['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].every(key => process.env[key])) {
    return res.status(503).json({ message: 'Image uploads are unavailable until Cloudinary is configured.' });
  }
  upload.single('image')(req, res, (error) => {
    if (error) return res.status(400).json({ message: error.message || 'Upload failed' });
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  try {
    const image = await uploadProductImage(req.file.buffer);
    return res.json({ message: 'Image uploaded successfully', image });
  } catch (error) {
    console.error('Cloudinary upload failed', { status: error.http_code });
    return res.status(502).json({ message: 'Could not upload the image.' });
  }
});

module.exports = router;
