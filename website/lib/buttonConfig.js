module.exports = {
  buttonConfig: {
    label: 'Button Config',
    type: 'object',
    fields: {
      add: {
        buttonStyle: {
          label: 'Style',
          type: 'radio',
          choices: [
            {
              label: 'Dark ⚫',
              value: 'btn-dark',
            },
            {
              label: 'Underline ⚪',
              value: 'sf-button_underline',
            },
          ],
          def: 'btn-dark',
        },
      },
    },
  },
};
