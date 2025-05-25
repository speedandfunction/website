const { google } = require('googleapis');
const { getEnv } = require('../../../../utils/env');

const googleSheetsService = {
  getGoogleSheetsClient() {
    const spreadsheetId = getEnv('SPREADSHEET_ID');
    const serviceAccountEmail = getEnv('SERVICE_ACCOUNT_EMAIL');
    const serviceAccountPrivateKey = getEnv('SERVICE_ACCOUNT_PRIVATE_KEY');

    const privateKey = serviceAccountPrivateKey.replace(/\\n/gu, '\n');
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return { spreadsheetId, auth };
  },

  async checkNeedHeaders(sheets, spreadsheetId) {
    try {
      const checkResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A1:Z1',
      });

      return (
        !checkResponse.data.values || checkResponse.data.values.length === 0
      );
    } catch (err) {
      throw new Error(`Headers check error: ${err.message}`);
    }
  },

  formatFormData(formData) {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();

    const headers = ['ID', 'Timestamp'];
    const rowData = [id, timestamp];

    const { _id, ...formFields } = formData;

    Object.entries(formFields).forEach(([key, value]) => {
      const headerName = key
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      headers.push(headerName);

      if (Array.isArray(value)) {
        rowData.push(value.join(', '));
      } else {
        rowData.push(value);
      }
    });

    return { headers, rowData };
  },

  async appendToSheet(sheets, spreadsheetId, values) {
    return await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      resource: { values },
    });
  },

  async sendFormDataToGoogleSheets(formData) {
    const { spreadsheetId, auth } = this.getGoogleSheetsClient();
    if (!auth) {
      throw new Error('Google Sheets auth failed');
    }

    const sheets = google.sheets({ version: 'v4', auth });

    const { headers, rowData } = this.formatFormData(formData);
    const needHeaders = await this.checkNeedHeaders(sheets, spreadsheetId);

    if (needHeaders) {
      await this.appendToSheet(sheets, spreadsheetId, [headers]);
    }

    await this.appendToSheet(sheets, spreadsheetId, [rowData]);
    return true;
  },
};

module.exports = googleSheetsService;
