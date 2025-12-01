import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

export async function getAuth() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
        throw new Error('Missing Google Sheets credentials in environment variables.');
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: SCOPES,
    });

    return auth;
}

export async function getContacts(sheetId, tabName) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: `${tabName}!A:D`, // Name, Phone, Status, Comment
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        // Assume first row is header
        const data = rows.slice(1).map((row, index) => {
            return {
                rowNumber: index + 2, // 1-based index, +1 for header
                name: row[0] || 'Unknown',
                phone: row[1] || '',
                status: row[2] || 'New',
                comment: row[3] || '',
            };
        });

        return data;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
    }
}

export async function updateStatus(sheetId, tabName, rowNumber, status) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${tabName}!C${rowNumber}`, // Column C is Status
            valueInputOption: 'RAW',
            requestBody: {
                values: [[status]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
    }
}

export async function updateComment(sheetId, tabName, rowNumber, comment) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${tabName}!D${rowNumber}`, // Column D is Comment
            valueInputOption: 'RAW',
            requestBody: {
                values: [[comment]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
    }
}

export async function updateName(sheetId, tabName, rowNumber, name) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${tabName}!A${rowNumber}`, // Column A is Name
            valueInputOption: 'RAW',
            requestBody: {
                values: [[name]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating name:', error);
        throw error;
    }
}

export async function updatePhone(sheetId, tabName, rowNumber, phone) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${tabName}!B${rowNumber}`, // Column B is Phone
            valueInputOption: 'RAW',
            requestBody: {
                values: [[phone]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating phone:', error);
        throw error;
    }
}

export async function createNewSheet(sheetId, title, data) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // 1. Add new sheet
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: title,
                            },
                        },
                    },
                ],
            },
        });

        // 2. Add data to the new sheet
        // Prepare values: Header + Data
        const values = [
            ['Name', 'Phone Number', 'Status', 'Comment'], // Header
            ...data.map(item => [item.name, item.phone, item.status || 'New', item.comment || ''])
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `${title}!A1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: values,
            },
        });

        return true;
    } catch (error) {
        console.error('Error creating new sheet:', error);
        throw error;
    }
}

export async function getSheets(sheetId) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        return response.data.sheets.map(sheet => sheet.properties.title);
    } catch (error) {
        console.error('Error fetching sheets:', error);
        throw error;
    }
}

export async function deleteSheet(sheetId, title) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // First, find the sheetId (integer) for the given title
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        const sheet = spreadsheet.data.sheets.find(
            (s) => s.properties.title === title
        );

        if (!sheet) {
            throw new Error(`Sheet with title "${title}" not found`);
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [
                    {
                        deleteSheet: {
                            sheetId: sheet.properties.sheetId,
                        },
                    },
                ],
            },
        });

        return true;
    } catch (error) {
        console.error('Error deleting sheet:', error);
        throw error;
    }
}

export async function deleteContacts(sheetId, tabName, rowNumbers) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Sort rowNumbers descending to avoid index shifting issues when deleting
        const sortedRows = [...rowNumbers].sort((a, b) => b - a);

        const requests = sortedRows.map((row) => ({
            deleteDimension: {
                range: {
                    sheetId: null, // We need to find the sheetId first
                    dimension: 'ROWS',
                    startIndex: row - 1, // 0-based index
                    endIndex: row,
                },
            },
        }));

        // We need the integer sheetId for the tabName
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        const sheet = spreadsheet.data.sheets.find(
            (s) => s.properties.title === tabName
        );

        if (!sheet) {
            throw new Error(`Sheet with title "${tabName}" not found`);
        }

        // Update the sheetId in requests
        requests.forEach(req => req.deleteDimension.range.sheetId = sheet.properties.sheetId);

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: requests,
            },
        });

        return true;
    } catch (error) {
        console.error('Error deleting contacts:', error);
        throw error;
    }
}

// ============================================
// OPPORTUNITY MANAGEMENT FUNCTIONS
// ============================================

export async function createOpportunitySheet(sheetId) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Check if Opportunities sheet already exists
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        const opportunitySheet = spreadsheet.data.sheets.find(
            (s) => s.properties.title === 'Opportunities'
        );

        if (opportunitySheet) {
            return true; // Sheet already exists
        }

        // Create Opportunities sheet
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: 'Opportunities',
                            },
                        },
                    },
                ],
            },
        });

        // Add header row
        const headers = [
            'Name',
            'Contact Name',
            'Contact Phone',
            'Amount',
            'Stage',
            'Expected Close Date',
            'Notes',
            'Created Date',
            'Source'
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'Opportunities!A1',
            valueInputOption: 'RAW',
            requestBody: {
                values: [headers],
            },
        });

        return true;
    } catch (error) {
        console.error('Error creating opportunity sheet:', error);
        throw error;
    }
}

export async function getOpportunities(sheetId) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Ensure Opportunities sheet exists
        await createOpportunitySheet(sheetId);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Opportunities!A:I', // All columns
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        // Skip header row
        const data = rows.slice(1).map((row, index) => ({
            rowNumber: index + 2,
            name: row[0] || '',
            contactName: row[1] || '',
            contactPhone: row[2] || '',
            amount: row[3] || '',
            stage: row[4] || 'Lead',
            expectedCloseDate: row[5] || '',
            notes: row[6] || '',
            createdDate: row[7] || '',
            source: row[8] || '',
        }));

        return data;
    } catch (error) {
        console.error('Error fetching opportunities:', error);
        throw error;
    }
}

export async function createOpportunity(sheetId, opportunityData) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Ensure Opportunities sheet exists
        await createOpportunitySheet(sheetId);

        const {
            name,
            contactName,
            contactPhone,
            amount,
            stage,
            expectedCloseDate,
            notes,
            source
        } = opportunityData;

        const createdDate = new Date().toLocaleDateString();

        const values = [[
            name || '',
            contactName || '',
            contactPhone || '',
            amount || '',
            stage || 'Lead',
            expectedCloseDate || '',
            notes || '',
            createdDate,
            source || 'Manual Entry'
        ]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Opportunities!A:I',
            valueInputOption: 'RAW',
            requestBody: {
                values: values,
            },
        });

        return true;
    } catch (error) {
        console.error('Error creating opportunity:', error);
        throw error;
    }
}

export async function updateOpportunityStage(sheetId, rowNumber, stage) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Opportunities!E${rowNumber}`, // Column E is Stage
            valueInputOption: 'RAW',
            requestBody: {
                values: [[stage]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating opportunity stage:', error);
        throw error;
    }
}

export async function updateOpportunityNotes(sheetId, rowNumber, notes) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Opportunities!G${rowNumber}`, // Column G is Notes
            valueInputOption: 'RAW',
            requestBody: {
                values: [[notes]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating opportunity notes:', error);
        throw error;
    }
}

export async function updateOpportunityAmount(sheetId, rowNumber, amount) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Opportunities!D${rowNumber}`, // Column D is Amount
            valueInputOption: 'RAW',
            requestBody: {
                values: [[amount]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating opportunity amount:', error);
        throw error;
    }
}

export async function updateOpportunityCloseDate(sheetId, rowNumber, closeDate) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Opportunities!F${rowNumber}`, // Column F is Expected Close Date
            valueInputOption: 'RAW',
            requestBody: {
                values: [[closeDate]],
            },
        });
        return true;
    } catch (error) {
        console.error('Error updating opportunity close date:', error);
        throw error;
    }
}

// ============================================
// TEMPLATE MANAGEMENT FUNCTIONS
// ============================================

export async function createTemplateSheet(sheetId) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Check if Templates sheet already exists
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        const templateSheet = spreadsheet.data.sheets.find(
            (s) => s.properties.title === 'Templates'
        );

        if (templateSheet) {
            return true; // Sheet already exists
        }

        // Create Templates sheet
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: 'Templates',
                            },
                        },
                    },
                ],
            },
        });

        // Add header row
        const headers = [
            'ID',
            'Name',
            'Message',
            'HTML Content',
            'Created Date',
            'Modified Date'
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: 'Templates!A1',
            valueInputOption: 'RAW',
            requestBody: {
                values: [headers],
            },
        });

        return true;
    } catch (error) {
        console.error('Error creating template sheet:', error);
        throw error;
    }
}

export async function getTemplates(sheetId) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Ensure Templates sheet exists
        await createTemplateSheet(sheetId);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Templates!A:F', // All columns
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }

        // Skip header row
        const data = rows.slice(1).map((row, index) => ({
            rowNumber: index + 2,
            id: row[0] || '',
            name: row[1] || '',
            message: row[2] || '',
            htmlContent: row[3] || '',
            createdDate: row[4] || '',
            modifiedDate: row[5] || '',
        }));

        return data;
    } catch (error) {
        console.error('Error fetching templates:', error);
        throw error;
    }
}

export async function createTemplate(sheetId, templateData) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Ensure Templates sheet exists
        await createTemplateSheet(sheetId);

        const { name, message, htmlContent } = templateData;

        // Generate unique ID
        const id = `TPL-${Date.now()}`;
        const createdDate = new Date().toLocaleString();

        const values = [[
            id,
            name || '',
            message || '',
            htmlContent || '',
            createdDate,
            createdDate
        ]];

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'Templates!A:F',
            valueInputOption: 'RAW',
            requestBody: {
                values: values,
            },
        });

        return { success: true, id };
    } catch (error) {
        console.error('Error creating template:', error);
        throw error;
    }
}

export async function updateTemplate(sheetId, rowNumber, templateData) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        const { name, message, htmlContent } = templateData;
        const modifiedDate = new Date().toLocaleString();

        // Update the entire row except ID and Created Date
        const values = [[
            name || '',
            message || '',
            htmlContent || '',
            modifiedDate
        ]];

        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Templates!B${rowNumber}:E${rowNumber}`, // Columns B to E
            valueInputOption: 'RAW',
            requestBody: {
                values: values,
            },
        });

        // Also update modified date
        await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Templates!F${rowNumber}`, // Column F is Modified Date
            valueInputOption: 'RAW',
            requestBody: {
                values: [[modifiedDate]],
            },
        });

        return true;
    } catch (error) {
        console.error('Error updating template:', error);
        throw error;
    }
}

export async function deleteTemplate(sheetId, rowNumber) {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Get the Templates sheet ID
        const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId: sheetId,
        });

        const sheet = spreadsheet.data.sheets.find(
            (s) => s.properties.title === 'Templates'
        );

        if (!sheet) {
            throw new Error('Templates sheet not found');
        }

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: sheet.properties.sheetId,
                                dimension: 'ROWS',
                                startIndex: rowNumber - 1, // 0-based index
                                endIndex: rowNumber,
                            },
                        },
                    },
                ],
            },
        });

        return true;
    } catch (error) {
        console.error('Error deleting template:', error);
        throw error;
    }
}
