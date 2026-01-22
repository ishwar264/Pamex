const API_KEY = 'NiWj7etHgp66jq0tFdYCwA0xDsM8lIc0m6aoGEJP_zk';

async function listTemplates() {
    try {
        const response = await fetch('https://api.interakt.ai/v1/public/track/organization/templates?offset=0&limit=20', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('With Raw Key:', JSON.stringify(data, null, 2));

        const base64Key = Buffer.from(API_KEY + ':').toString('base64');
        const response2 = await fetch('https://api.interakt.ai/v1/public/track/organization/templates?offset=0&limit=20', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${base64Key}`,
                'Content-Type': 'application/json'
            }
        });
        const data2 = await response2.json();
        console.log('With Base64(key:):', JSON.stringify(data2, null, 2));

        const base64KeyOnly = Buffer.from(API_KEY).toString('base64');
        const response3 = await fetch('https://api.interakt.ai/v1/public/track/organization/templates?offset=0&limit=20', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${base64KeyOnly}`,
                'Content-Type': 'application/json'
            }
        });
        const data3 = await response3.json();
        console.log('With Base64(key):', JSON.stringify(data3, null, 2));

    } catch (error) {
        console.error('Error:', error);
    }
}

listTemplates();
