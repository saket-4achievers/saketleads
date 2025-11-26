import { NextResponse } from 'next/server';
import { getSheets, deleteSheet } from '@/lib/googleSheets';

export async function GET() {
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
        return NextResponse.json({ error: 'Google Sheet ID not configured' }, { status: 500 });
    }

    try {
        const sheets = await getSheets(sheetId);
        return NextResponse.json({ sheets });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sheets' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
        return NextResponse.json({ error: 'Google Sheet ID not configured' }, { status: 500 });
    }

    if (!title) {
        return NextResponse.json({ error: 'Sheet title is required' }, { status: 400 });
    }

    try {
        await deleteSheet(sheetId, title);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete sheet' }, { status: 500 });
    }
}
