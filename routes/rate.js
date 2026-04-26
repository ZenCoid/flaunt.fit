const express = require('express');
const router = express.Router();
const multer = require('multer');
const { rateOutfit } = require('../services/geminiService');

// Store in memory instead of disk (better for serverless)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
        }
    }
});

const OCCASIONS = [
    'casual', 'office', 'formal', 'wedding_guest',
    'date_night', 'dholki_mehndi', 'nikah',
    'street_style', 'gym', 'party'
];

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'flaunt.fit API is running',
        version: '1.0.0'
    });
});

/**
 * GET /api/occasions
 * Get list of supported occasions
 */
router.get('/occasions', (req, res) => {
    res.json({ occasions: OCCASIONS });
});

/**
 * POST /api/rate
 * Analyze an outfit image
 * 
 * Body (multipart/form-data):
 * - outfit: image file (required)
 * - occasion: string (optional, default: 'casual')
 */
router.post('/rate', upload.single('outfit'), async (req, res) => {
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image uploaded. Please send an image in the "outfit" field.'
            });
        }

        // Validate occasion
        const occasion = req.body.occasion || 'casual';
        if (!OCCASIONS.includes(occasion)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid occasion',
                validOccasions: OCCASIONS
            });
        }

        // Convert buffer to base64
        const imageBase64 = req.file.buffer.toString('base64');
        const mimeType = req.file.mimetype;

        // Call Gemini API
        const result = await rateOutfit(imageBase64, mimeType, occasion);

        res.json({
            success: true,
            occasion,
            scores: result
        });

    } catch (err) {
        console.error('Rating error:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze outfit',
            detail: err.message
        });
    }
});

module.exports = router;