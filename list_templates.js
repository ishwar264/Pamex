const INTERAKT_API_KEY = 'TmlXajdldEhncDY2anEwdEZkWUN3QTB4RHNNOGxJYzBtNmFvR0VKUF96azo';

async function listTemplates() {
    try {
        const response = await fetch('https://api.interakt.ai/v1/public/track/organization/templates?offset=0&limit=20', {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${INTERAKT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

listTemplates();
