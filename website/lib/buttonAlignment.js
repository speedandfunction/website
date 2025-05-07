module.exports = {
  buttonAlignment: {
    label: 'Button Alignment Settings',
    type: 'object',
    fields: {
      add: {
        alignment: {
          label: 'Alignment',
          type: 'radio',
          choices: [
            {
              label: 'Left',
              value: 'left',
            },
            {
              label: 'Center',
              value: 'center',
            },
            {
              label: 'Right',
              value: 'right',
            },
          ],
          def: 'center',
          help: 'Choose how to align the button. This option is available only if you create one button.',
        },
      },
    },
  },
};
