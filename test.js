const fs = require('fs');
const https = require('https');
const http = require('http');

async function test() {
    const imagePath = 'C:\\Users\\arham\\Downloads\\470361471_564477883047142_2875474717039997199_n.jpg';
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');

    const boundary = '----FormBoundary' + Date.now();
    
    const payload = [
        `--${boundary}`,
        'Content-Disposition: form-data; name="outfit"; filename="test.jpg"',
        'Content-Type: image/jpeg',
        '',
        imageBuffer.toString('binary'),
        `--${boundary}`,
        'Content-Disposition: form-data; name="occasion"',
        '',
        'casual',
        `--${boundary}--`
    ].join('\r\n');

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/rate',
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': Buffer.byteLength(payload, 'binary')
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
        });
    });

    req.on('error', console.error);
    req.write(payload, 'binary');
    req.end();
}

test();