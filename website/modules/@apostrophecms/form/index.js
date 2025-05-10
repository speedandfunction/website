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
          placeholder: '1vBBJqm5W4wk1IOlBoYA01ImVWE-plyPZ5wwH1jwZFiY',
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
          label: 'Google Service Account private_key',
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
  handlers(self, options) {
    return {
      submission: {
        async usePostmark(req, form, submission) {
          if (form.enablePostmark) {
            const emailSubject = `${form.title} Form (${form.domainName || 'defaultdomain.com'})`;
            let html = '<ul>';
            for (const key in submission) {
              if (Object.hasOwn(submission, key)) {
                html += `<li><strong>${key}:</strong> ${submission[key]}</li>`;
              }
            }
            html += '</ul>';

            const postmarkClient = new postmark.ServerClient(
              form.postmarkApiKey,
            );

            const sendPostmarkEmail = async (from, to, subject, htmlBody) => {
              try {
                const response = await postmarkClient.sendEmail({
                  From: from,
                  To: to,
                  Subject: subject,
                  HtmlBody: htmlBody,
                  MessageStream: 'outbound',
                });
                console.log(`Email sent successfully to ${to}`, response);
                if (response.ErrorCode) {
                  console.error(response.ErrorCode);
                }
              } catch (error) {
                console.error(`Error sending email to ${to}`, error);
              }
            };

            try {
              await sendPostmarkEmail(
                form.fromEmail,
                form.toEmail,
                emailSubject,
                html,
              );

              if (form.sendConfirmationEmail) {
                const senderEmail = submission[form.emailConfirmationField];

                if (senderEmail) {
                  const confirmationHtml =
                    '<p>Thank you for your submission! We will review your message as soon as possible.</p>';
                  await sendPostmarkEmail(
                    form.fromEmail,
                    senderEmail,
                    'Confirmation of Form Submission from Procrea',
                    confirmationHtml,
                  );
                } else {
                  console.warn(
                    `Email confirmation field "${form.emailConfirmationField}" not found in the submission.`,
                  );
                }
              }
            } catch (error) {
              console.error('Error processing email sending', error);
            }
          }

          if (form.enableSpreadsheet) {
            try {
              /*
               * Insert data into Google Sheets
               * Ensure this is defined in your form
               */
              const { spreadsheetId } = form;
              // Specify the sheet and range, e.g., Sheet1!A1
              const range = 'Sheet1!A1';

              // Google Sheets JWT Authentication
              const auth = new google.auth.JWT({
                email: form.serviceAccountEmail,
                key: form.serviceAccountPrivateKey.replace(/\\n/g, '\n'),
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
              });

              const sheets = google.sheets({
                version: 'v4',
                auth,
              });
              const id = Date.now().toString();

              const values = [
                id,
                new Date().toISOString(),
                ...Object.values(submission),
              ];
              // Convert submission data to array format for Sheets

              const resource = { values: [values] };

              await sheets.spreadsheets.values.append({
                spreadsheetId,
                range,
                valueInputOption: 'RAW',
                resource,
              });
              console.log('Data inserted into Google Sheets successfully.');
            } catch (error) {
              console.error('Error Sheets data insertion', error);
            }
          }
        },
      },
    };
  },
};
