const API_KEY = 'NiWj7etHgp66jq0tFdYCwA0xDsM8lIc0m6aoGEJP_zk';

async function testSendMessage() {
    const base64Key = Buffer.from(API_KEY + ':').toString('base64');

    // Test with separate fields as per docs
    const payload = {
        countryCode: "+91",
        phoneNumber: "6261855369", // Using the number from the feedback/docs if available, or just a known one. 
        // Wait, I'll use a dummy number first to check for API error vs number error.
        type: "Template",
        template: {
            name: "indasanalytics_",
            languageCode: "en",
            bodyValues: ["Test User"]
        }
    };

    console.log('Testing with separate fields...');
    try {
        const response = await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${base64Key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testSendMessage();
