module.exports = {
  buttonConfig: {
    label: 'Button Style Settings',
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
          help: 'Choose how the button will look. This option is available only if you create one button.',
        },
      },
    },
  },
};
