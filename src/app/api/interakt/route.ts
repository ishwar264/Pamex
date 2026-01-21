import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phoneNumber, countryCode, bodyValues } = body;

        if (!phoneNumber || !countryCode) {
            return NextResponse.json({ error: 'Phone number and country code are required' }, { status: 400 });
        }

        const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;

        if (!INTERAKT_API_KEY) {
            console.error('INTERAKT_API_KEY is not defined in environment variables');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Determine if we should use fullPhoneNumber or split
        // Interakt docs: You must provide either (countryCode + phoneNumber) OR (fullPhoneNumber).
        // The user's form has contactNo. We'll pass it as phoneNumber and countryCode.

        const payload = {
            countryCode: countryCode,
            phoneNumber: phoneNumber,
            type: "Template",
            template: {
                name: "indasanalytics_",
                languageCode: "en",
                bodyValues: bodyValues
            }
        };

        console.log('Sending to Interakt:', JSON.stringify(payload, null, 2));

        const response = await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${INTERAKT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Interakt API Error:', data);
            return NextResponse.json({ error: data.message || 'Failed to send WhatsApp message' }, { status: response.status });
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Interakt Route Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
