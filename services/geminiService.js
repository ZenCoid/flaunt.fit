const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini (when you get the key)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Rate an outfit using Gemini 1.5 Flash
 * @param {string} imageBase64 - Base64 encoded image (NO data: prefix)
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @param {string} occasion - The occasion for the outfit
 * @returns {Promise<Object>} Analysis results
 */
async function rateOutfit(imageBase64, mimeType, occasion) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are FLAUNT, an expert AI fashion stylist with deep knowledge of global fashion, color theory, body types, and cultural appropriateness.

TASK: Analyze this outfit for a ${occasion} occasion.

INSTRUCTIONS:
1. Identify all visible clothing items and accessories
2. Analyze color coordination and combination  
3. Assess the fit and silhouette
4. Evaluate appropriateness for the stated occasion
5. Provide specific, actionable improvement suggestions
6. Be honest but constructive - don't be overly harsh or overly flattering

RESPONSE FORMAT (JSON only, no markdown, no explanation):
{
  "overall_score": <number 1-10>,
  "color_harmony": <number 1-10>,
  "occasion_fit": <number 1-10>,
  "style_coherence": <number 1-10>,
  "fit_proportion": <number 1-10>,
  "trend_score": <number 1-10>,
  "summary": "<one punchy sentence about the outfit>",
  "top_compliment": "<best thing about this outfit>",
  "top_improvement": "<single most important improvement>",
  "items_detected": ["<item 1>", "<item 2>", "<item 3>"],
  "quick_tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

IMPORTANT: Respond ONLY with valid JSON, no markdown formatting, no other text.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType,
                    data: imageBase64
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up response (remove markdown code blocks if present)
        const clean = text.replace(/```json|```/g, '').trim();

        return JSON.parse(clean);

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Failed to analyze outfit: ${error.message}`);
    }
}

/**
 * Get available occasions
 */
const OCCASIONS = [
    'casual',
    'office',
    'formal',
    'wedding_guest',
    'date_night',
    'dholki_mehndi',
    'nikah',
    'street_style',
    'gym',
    'party'
];

module.exports = { rateOutfit, OCCASIONS };