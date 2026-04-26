/**
 * FLAUNT - Outfit Analysis Service (OpenRouter)
 * Uses free vision models via OpenRouter
 */

/**
 * Rate an outfit using OpenRouter API
 * @param {string} imageBase64 - Base64 encoded image (NO data: prefix)
 * @param {string} mimeType - Image MIME type (e.g., 'image/jpeg')
 * @param {string} occasion - The occasion for the outfit
 * @returns {Promise<Object>} Analysis results
 */
async function rateOutfit(imageBase64, mimeType, occasion) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://flaunt.fit',
                'X-Title': 'FLAUNT'
            },
            body: JSON.stringify({
                // Free vision models on OpenRouter (try in order)
                model: 'google/gemma-3-4b-it:free',
                messages: [{
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mimeType};base64,${imageBase64}`
                            }
                        },
                        {
                            type: 'text',
                            text: `You are FLAUNT, an expert AI fashion stylist.

Analyze this outfit for: ${occasion}

Return ONLY valid JSON (no markdown, no explanation):
{
  "overall_score": <1-10>,
  "color_harmony": <1-10>,
  "occasion_fit": <1-10>,
  "style_coherence": <1-10>,
  "fit_proportion": <1-10>,
  "trend_score": <1-10>,
  "summary": "<one sentence>",
  "top_compliment": "<best thing>",
  "top_improvement": "<one improvement>",
  "items_detected": ["item1", "item2"],
  "quick_tips": ["tip1", "tip2", "tip3"]
}`
                        }
                    ]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenRouter Error:', JSON.stringify(errorData, null, 2));
            throw new Error(errorData.error?.message || response.statusText);
        }

        const data = await response.json();
        console.log('OpenRouter Response:', JSON.stringify(data, null, 2));

        const text = data.choices[0].message.content;
        const clean = text.replace(/```json|```/g, '').trim();

        return JSON.parse(clean);

    } catch (error) {
        console.error('API Error:', error);
        throw new Error(`Failed to analyze outfit: ${error.message}`);
    }
}

const OCCASIONS = [
    'casual', 'office', 'formal', 'wedding_guest',
    'date_night', 'dholki_mehndi', 'nikah',
    'street_style', 'gym', 'party'
];

module.exports = { rateOutfit, OCCASIONS };