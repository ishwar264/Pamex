import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { phoneNumber, countryCode, bodyValues, leadData } = body;

        const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY;
        const BACKUP_URL = "https://script.google.com/macros/s/AKfycbzdndngvElGi39kjRQfSUKMzQD4FhJOzxkyBMZWXxyJ9kSih4He7zs-Y0zaX2TqYGWm/exec";

        if (!INTERAKT_API_KEY) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const payload = {
            fullPhoneNumber: `${countryCode}${phoneNumber}`.replace('+', ''),
            type: "Template",
            template: {
                name: "indasanalytics_",
                languageCode: "en",
                bodyValues: bodyValues
            }
        };

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

        if (!interaktResponse.ok) {
            console.error('Interakt Failed, sending to backup sheet...', data);

            // WHATSAPP FAILED -> SEND TO BACKUP SHEET FROM SERVER
            try {
                await fetch(BACKUP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify({
                        ...leadData,
                        whatsapp_status: "FAILED",
                        error_reason: data.message || "Template/Number Error"
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
