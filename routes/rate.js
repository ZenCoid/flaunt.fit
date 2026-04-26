const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { rateOutfit } = require('../services/geminiService');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        allowed.test(path.extname(file.originalname).toLowerCase())
            ? cb(null, true)
            : cb(new Error('Images only'));
    }
});

const OCCASIONS = [
    'casual', 'office', 'formal', 'wedding_guest',
    'date_night', 'dholki_mehndi', 'nikah',
    'street_style', 'gym', 'party'
];

router.get('/health', (req, res) => {
    res.json({ status: 'flaunt.fit API is running' });
});

router.get('/occasions', (req, res) => {
    res.json({ occasions: OCCASIONS });
});

router.post('/rate', upload.single('outfit'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

        const occasion = req.body.occasion || 'casual';
        if (!OCCASIONS.includes(occasion)) {
            return res.status(400).json({ error: 'Invalid occasion', valid: OCCASIONS });
        }

        const result = await rateOutfit(req.file.path, occasion);

        res.json({ success: true, occasion, scores: result });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Rating failed', detail: err.message });
    }
});

module.exports = router;