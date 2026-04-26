const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function saveRating(userId, occasion, imagePath, scores) {
    const { data, error } = await supabase.from('ratings').insert([{
        user_id: userId,
        occasion,
        image_path: imagePath,
        ...scores
    }]);
    if (error) throw error;
    return data;
}

module.exports = { saveRating };