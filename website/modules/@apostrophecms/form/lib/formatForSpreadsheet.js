const { formatHeaderName } = require('../../../../utils/formatHeaderName');

const generateHeaders = (formData) => {
  const headers = ['ID', 'Timestamp'];
  const { _id, ...formFields } = formData;

  for (const key of Object.keys(formFields)) {
    if (key !== 'g-recaptcha-response') {
      headers.push(formatHeaderName(key));
    }
  }

  return headers;
};

const generateRowData = (formData) => {
  const id = Date.now().toString();
  const timestamp = new Date().toISOString();
  const rowData = [id, timestamp];

  const { _id, ...formFields } = formData;

  for (const [key, value] of Object.entries(formFields)) {
    if (key !== 'g-recaptcha-response') {
      if (Array.isArray(value)) {
        rowData.push(value.join(', '));
      } else {
        rowData.push(value);
      }
    }
  }

  return rowData;
};

const formatForSpreadsheet = (formData) => {
  const headers = generateHeaders(formData);
  const rowData = generateRowData(formData);

  return { headers, rowData };
};

module.exports = {
  formatForSpreadsheet,
};
