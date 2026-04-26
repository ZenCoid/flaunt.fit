const fs = require('fs');

async function rateOutfit(imagePath, occasion) {
    const imageBase64 = fs.readFileSync(imagePath).toString('base64');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer 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`,
        },
        body: JSON.stringify({
            model: 'openrouter/free',
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image_url',
                        image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
                    },
                    {
                        type: 'text',
                        text: `You are a professional fashion stylist. Analyze this outfit for occasion: ${occasion}.

Return ONLY this exact JSON, no markdown, no explanation:
{
  "color_harmony": <0-10>,
  "occasion_fit": <0-10>,
  "style_coherence": <0-10>,
  "fit_proportion": <0-10>,
  "trend_score": <0-10>,
  "total_score": <weighted average using 20/25/20/20/15>,
  "summary": "<one punchy sentence>",
  "top_compliment": "<best thing about outfit>",
  "top_improvement": "<single most important improvement>"
}`
                    }
                ]
            }]
        })
    });

    const data = await response.json();
    console.log('OpenRouter response:', JSON.stringify(data, null, 2));
    const text = data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
}

module.exports = { rateOutfit };