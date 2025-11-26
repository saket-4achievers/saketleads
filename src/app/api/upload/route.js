import { NextResponse } from 'next/server';
import { createNewSheet } from '@/lib/googleSheets';
import Papa from 'papaparse';

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
        return NextResponse.json({ error: 'Google Sheet ID not configured' }, { status: 500 });
    }

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    try {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });

        // Normalize data keys
        const data = result.data.map(row => ({
            name: row['Name'] || row['name'] || 'Unknown',
            phone: row['Phone Number'] || row['Phone'] || row['phone'] || '',
            status: row['Status'] || row['status'] || 'New'
        }));

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const title = `Upload_${timestamp}`;

        await createNewSheet(sheetId, title, data);

        return NextResponse.json({ success: true, sheetName: title });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
    }
}
