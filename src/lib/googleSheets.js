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
