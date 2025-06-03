const { formatHeaderName } = require('../../../../utils/formatHeaderName');

class FormDataFormatter {
  static generateHeaders(formData) {
    const headers = ['ID', 'Timestamp'];
    const { _id, ...formFields } = formData;

    for (const key of Object.keys(formFields)) {
      headers.push(formatHeaderName(key));
    }

    return headers;
  }

  static generateRowData(formData) {
    const id = Date.now().toString();
    const timestamp = new Date().toISOString();
    const rowData = [id, timestamp];

    const { _id, ...formFields } = formData;

    for (const value of Object.values(formFields)) {
      if (Array.isArray(value)) {
        rowData.push(value.join(', '));
      } else {
        rowData.push(value);
      }
    }

    return rowData;
  }

  static formatForSpreadsheet(formData) {
    const headers = this.generateHeaders(formData);
    const rowData = this.generateRowData(formData);

    return { headers, rowData };
  }
}

module.exports = FormDataFormatter; 