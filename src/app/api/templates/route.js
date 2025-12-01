import { NextResponse } from 'next/server';
import {
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
} from '@/lib/googleSheets';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

// GET - Fetch all templates
export async function GET() {
    try {
        const templates = await getTemplates(SHEET_ID);
        return NextResponse.json({ success: true, templates });
    } catch (error) {
        console.error('Error in GET /api/templates:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// POST - Create a new template
export async function POST(request) {
    try {
        const body = await request.json();
        const { name, message, htmlContent } = body;

        if (!name || !message) {
            return NextResponse.json(
                { success: false, error: 'Name and message are required' },
                { status: 400 }
            );
        }

        const result = await createTemplate(SHEET_ID, {
            name,
            message,
            htmlContent: htmlContent || ''
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Error in POST /api/templates:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PUT - Update an existing template
export async function PUT(request) {
    try {
        const body = await request.json();
        const { rowNumber, name, message, htmlContent } = body;

        if (!rowNumber || !name || !message) {
            return NextResponse.json(
                { success: false, error: 'Row number, name, and message are required' },
                { status: 400 }
            );
        }

        await updateTemplate(SHEET_ID, rowNumber, {
            name,
            message,
            htmlContent: htmlContent || ''
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /api/templates:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Delete a template
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const rowNumber = searchParams.get('rowNumber');

        if (!rowNumber) {
            return NextResponse.json(
                { success: false, error: 'Row number is required' },
                { status: 400 }
            );
        }

        await deleteTemplate(SHEET_ID, parseInt(rowNumber));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in DELETE /api/templates:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
