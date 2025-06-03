class MyOwnError extends Error {
  constructor(message) {
    super(message);
    // write to log.
    this.name = 'MyOwnError';
  }
}

const APPEND_RANGE = 'Sheet1!A1';

class GoogleSheetsClient {
  constructor(sheets, spreadsheetId) {
    this.sheets = sheets;
    this.spreadsheetId = spreadsheetId;
  }

  async checkIfEmpty(range = 'Sheet1!A1:Z1') {
    try {
      const checkResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range,
      });

      return !checkResponse.data?.values?.length;
    } catch (err) {
      throw err;
    }
  }

  async appendValues(range = APPEND_RANGE, values) {
    try {
      return await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource: { values },
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = GoogleSheetsClient; 