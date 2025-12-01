import { NextResponse } from 'next/server';
import {
    getOpportunities,
    createOpportunity,
    updateOpportunityStage,
    updateOpportunityNotes,
    updateOpportunityAmount,
    updateOpportunityCloseDate
} from '@/lib/googleSheets';

export async function GET(request) {
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
        return NextResponse.json({ error: 'Google Sheet ID not configured' }, { status: 500 });
    }

    try {
        const opportunities = await getOpportunities(sheetId);
        return NextResponse.json({ opportunities });
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
    }
}

export async function POST(request) {
    const body = await request.json();
    const { rowNumber, stage, notes, amount, expectedCloseDate, ...opportunityData } = body;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!sheetId) {
        return NextResponse.json({ error: 'Google Sheet ID not configured' }, { status: 500 });
    }

    try {
        // If rowNumber is provided, update existing opportunity
        if (rowNumber) {
            if (stage !== undefined) {
                await updateOpportunityStage(sheetId, rowNumber, stage);
            }
            if (notes !== undefined) {
                await updateOpportunityNotes(sheetId, rowNumber, notes);
            }
            if (amount !== undefined) {
                await updateOpportunityAmount(sheetId, rowNumber, amount);
            }
            if (expectedCloseDate !== undefined) {
                await updateOpportunityCloseDate(sheetId, rowNumber, expectedCloseDate);
            }
            return NextResponse.json({ success: true });
        }

        // Otherwise, create new opportunity
        await createOpportunity(sheetId, opportunityData);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing opportunity:', error);
        return NextResponse.json({ error: 'Failed to process opportunity' }, { status: 500 });
    }
}
