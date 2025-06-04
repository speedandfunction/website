class GoogleSheetsClient {
  constructor(sheets, spreadsheetId) {
    if (!sheets) {
      throw new Error('Sheets service is required');
    }
    if (!spreadsheetId) {
      throw new Error('Spreadsheet ID is required');
    }
    this.sheets = sheets;
    this.spreadsheetId = spreadsheetId;
  }

  async checkIfEmpty(range) {
    if (!range) {
      throw new Error('Range is required');
    }

    const checkResponse = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    return !checkResponse.data?.values?.length;
  }

  async appendValues(range, values) {
    if (!range) {
      throw new Error('Range is required');
    }
    if (!values || !Array.isArray(values)) {
      throw new Error('Values must be an array');
    }

    return await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'RAW',
      resource: { values },
    });
  }
}

module.exports = GoogleSheetsClient;
