import { NextResponse } from 'next/server';
import { getContacts, updateStatus, updateComment, updateName, updatePhone, deleteContacts } from '@/lib/googleSheets';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const tabName = searchParams.get('tab') || 'Sheet1'; // Default to Sheet1

    if (!sheetId) {
        return NextResponse.json({ error: 'Google Sheet ID not configured' }, { status: 500 });
    }

    try {
        const contacts = await getContacts(sheetId, tabName);
        return NextResponse.json({ contacts });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

export async function POST(request) {
    const body = await request.json();
    const { tabName, rowNumber, status, comment, name, phone } = body;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
        return NextResponse.json({ error: 'Google Sheet ID not configured' }, { status: 500 });
    }

    if (!tabName || !rowNumber) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        if (status !== undefined) {
            await updateStatus(sheetId, tabName, rowNumber, status);
        }
        if (comment !== undefined) {
            await updateComment(sheetId, tabName, rowNumber, comment);
        }
        if (name !== undefined) {
            await updateName(sheetId, tabName, rowNumber, name);
        }
        if (phone !== undefined) {
            await updatePhone(sheetId, tabName, rowNumber, phone);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
}

export async function DELETE(request) {
    const body = await request.json();
    const { tabName, rowNumbers } = body;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
        return NextResponse.json({ error: 'Google Sheet ID not configured' }, { status: 500 });
    }

    if (!tabName || !rowNumbers || !Array.isArray(rowNumbers)) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        await deleteContacts(sheetId, tabName, rowNumbers);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete contacts' }, { status: 500 });
    }
}
