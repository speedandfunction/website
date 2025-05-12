const { google } = require('googleapis');
const postmark = require('postmark');

module.exports = {
  options: {
    emailSubmissions: false,
    saveSubmissions: false,
    // Shortcut: 'G,J',
    fields: {
      add: {
        onSubmitSuccess: {
          label: 'Custom Code - On Submit Success',
          help: 'JavaScript code',
          placeholder: 'function runSubmitSuccess(event) {...custom code...}',
          type: 'string',
          textarea: true,
        },
        emailConfirmationField: {
          label: 'Specify the email field',
          help: 'Enter the "name" value of the field in which people will enter their email address.',
          type: 'string',
          required: true,
          if: {
            sendConfirmationEmail: true,
          },
        },
        enablePostmark: {
          label: 'Enable and configure connection to Postmark mailing.',
          help: 'To enable this function, you need to create a Postmark account',
          type: 'boolean',
          toggle: {
            true: 'Enable',
            false: 'Disable',
          },
          def: false,
        },
        postmarkApiKey: {
          type: 'string',
          help: 'Use the credentials from Postmark Default Transactional Stream',
          label: 'Postmark API Key',
          required: true,
          if: {
            enablePostmark: true,
          },
        },
        fromEmail: {
          label: 'From Email address',
          type: 'email',
          required: true,
          if: {
            enablePostmark: true,
          },
        },
        toEmail: {
          label: 'To Email address',
          type: 'email',
          required: true,
          if: {
            enablePostmark: true,
          },
        },
        enableSpreadsheet: {
          label: 'Enable and configure connection to Google Spreadsheets.',
          help: 'To enable this function, you need to create a Service Account in your Google Cloud Project and retrieve the client_email and private_key. See readme file in module folder.',
          type: 'boolean',
          toggle: {
            true: 'Enable',
            false: 'Disable',
          },
          def: false,
        },
        spreadsheetId: {
          label: 'Google Spreadsheet ID',
          type: 'string',
          help: 'Target spreadsheet',
          placeholder: 'your-spreadsheet-id',
          required: true,
          if: {
            enableSpreadsheet: true,
          },
        },
        serviceAccountEmail: {
          label: 'Google Service Account client_email',
          type: 'email',
          help: 'Please make sure to share your target sheet with this email and grant it editor access.',
          placeholder: 'procrea1@civil-zodiac-406414.iam.gserviceaccount.com',
          required: true,
          if: {
            enableSpreadsheet: true,
          },
        },
        serviceAccountPrivateKey: {
          type: 'string',
          placeholder: process.env.SERVICE_ACCOUNT_PRIVATE_KEY || '',
          textarea: true,
          required: true,
          if: {
            enableSpreadsheet: true,
          },
        },
      },
      group: {
        postmark: {
          label: 'Postmark Configs',
          fields: ['enablePostmark', 'postmarkApiKey', 'fromEmail', 'toEmail'],
        },
        googleSpreadsheet: {
          label: 'Google Spreadsheet',
          fields: [
            'enableSpreadsheet',
            'spreadsheetId',
            'serviceAccountEmail',
            'serviceAccountPrivateKey',
          ],
        },
        afterSubmit: {
          fields: ['onSubmitSuccess'],
        },
      },
    },
  },

  // Helper methods for email and spreadsheet functionality
  createEmailHtml(submission) {
    let html = '<ul>';
    // Create a safe copy of submission object to iterate through
    const safeSubmission = { ...submission };
    // Use a safer method to avoid object injection
    const htmlItems = Object.entries(safeSubmission).map(
      ([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`,
    );
    html += htmlItems.join('');
    html += '</ul>';
    return html;
  },

  createPostmarkClient(apiKey) {
    return new postmark.ServerClient(apiKey);
  },

  findFieldValue(submission, fieldName) {
    if (!fieldName) {
      return null;
    }

    // Use direct property access instead of iteration
    if (submission[fieldName] !== undefined) {
      return submission[fieldName];
    }

    return null;
  },

  prepareSheetData(submission) {
    const id = Date.now().toString();
    return [id, new Date().toISOString(), ...Object.values(submission)];
  },

  createSheetsClient(form) {
    const auth = new google.auth.JWT({
      email: form.serviceAccountEmail,
      key: form.serviceAccountPrivateKey.replace(/\\n/gu, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({
      version: 'v4',
      auth,
    });
  },

  createSendEmailFunction(postmarkClient) {
    const { apos } = this;
    return async (from, to, subject, htmlBody) => {
      try {
        const response = await postmarkClient.sendEmail({
          From: from,
          To: to,
          Subject: subject,
          HtmlBody: htmlBody,
          MessageStream: 'outbound',
        });
        apos.util.log(`Email sent successfully to ${to}`);
        if (response.ErrorCode) {
          apos.util.error(response.ErrorCode);
        }
      } catch (error) {
        apos.util.error(`Error sending email to ${to}`, error);
      }
    };
  },

  async sendConfirmationEmail(form, submission, sendEmailFunc) {
    const confirmationFieldName = form.emailConfirmationField;
    const senderEmail = this.findFieldValue(submission, confirmationFieldName);
    if (!senderEmail) {
      this.apos.util.warn(
        `Email confirmation field "${form.emailConfirmationField}" not found in the submission.`,
      );
      return false;
    }
    const confirmationHtml =
      '<p>Thank you for your submission! We will review your message as soon as possible.</p>';
    await sendEmailFunc(
      form.fromEmail,
      senderEmail,
      'Confirmation of Form Submission from Procrea',
      confirmationHtml,
    );
    return true;
  },

  async handlePostmark(form, submission) {
    const emailSubject = `${form.title} Form (${form.domainName || 'defaultdomain.com'})`;
    const html = this.createEmailHtml(submission);
    const postmarkClient = this.createPostmarkClient(form.postmarkApiKey);
    const sendPostmarkEmail = this.createSendEmailFunction(postmarkClient);

    try {
      // Send the main email
      await sendPostmarkEmail(form.fromEmail, form.toEmail, emailSubject, html);

      // Send confirmation email if configured
      if (form.sendConfirmationEmail) {
        await this.sendConfirmationEmail(form, submission, sendPostmarkEmail);
      }
    } catch (error) {
      this.apos.util.error('Error processing email sending', error);
    }
  },

  async handleSpreadsheet(form, submission) {
    try {
      const { spreadsheetId } = form;
      const range = 'Sheet1!A1';
      const sheets = this.createSheetsClient(form);
      const values = this.prepareSheetData(submission);
      const resource = { values: [values] };

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        resource,
      });
      this.apos.util.log('Data inserted into Google Sheets successfully.');
    } catch (error) {
      this.apos.util.error('Error Sheets data insertion', error);
    }
  },

  async processSubmission(req, form, submission) {
    if (form.enablePostmark) {
      await this.handlePostmark(form, submission);
    }

    if (form.enableSpreadsheet) {
      await this.handleSpreadsheet(form, submission);
    }
  },

  init(self) {
    // Register the event handler using the named function
    self.on('submission', self.processSubmission);
  },
};
