import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phoneNumber, countryCode, bodyValues, leadData } = body;

        const INTERAKT_API_KEY = (process.env.INTERAKT_API_KEY || '').trim();
        const BACKUP_URL = "https://script.google.com/macros/s/AKfycbzdndngvElGi39kjRQfSUKMzQD4FhJOzxkyBMZWXxyJ9kSih4He7zs-Y0zaX2TqYGWm/exec";

        if (!INTERAKT_API_KEY) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Interakt expects the API key in the header as: Authorization: Basic <YOUR_API_KEY>
        // Use the raw key (trimmed) from env. Log only a masked prefix for debugging.
        const maskedKey = INTERAKT_API_KEY ? `${INTERAKT_API_KEY.slice(0, 6)}...` : 'no-token';
        console.log('Interakt token present:', maskedKey);

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

        // Attempt Interakt WhatsApp
        const interaktResponse = await fetch('https://api.interakt.ai/v1/public/message/', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${INTERAKT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await interaktResponse.json();
        console.log('Interakt Response:', JSON.stringify(data, null, 2));

        if (!interaktResponse.ok || data.result === false) {
            console.error('Interakt Failed, sending to backup sheet...', data);

            // WHATSAPP FAILED -> SEND TO BACKUP SHEET FROM SERVER
            try {
                const errorMsg = data.message || (data.errors ? JSON.stringify(data.errors) : "Template/Number Error");
                await fetch(BACKUP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        ...leadData,
                        whatsapp_status: "FAILED",
                        error_reason: errorMsg
                    })
                });
            } catch (backupErr) {
                console.error('Backup Sheet Fetch Failed:', backupErr);
            }

            return NextResponse.json({
                success: false,
                error: data.message || 'WhatsApp Failed, saved to backup sheet'
            }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Interakt Route Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
