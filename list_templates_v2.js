const fs = require('fs');

const API_KEY = 'NiWj7etHgp66jq0tFdYCwA0xDsM8lIc0m6aoGEJP_zk';

async function listTemplates() {
    const results = {};
    try {
        const base64Key = Buffer.from(API_KEY + ':').toString('base64');
        const response = await fetch('https://api.interakt.ai/v1/public/track/organization/templates?offset=0&limit=20', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${base64Key}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        results.templates = data;

        fs.writeFileSync('templates_info.json', JSON.stringify(results, null, 2));
        console.log('Templates list saved to templates_info.json');

    } catch (error) {
        console.error('Error:', error);
        fs.writeFileSync('templates_info.json', JSON.stringify({ error: error.message }, null, 2));
    }
}

listTemplates();
