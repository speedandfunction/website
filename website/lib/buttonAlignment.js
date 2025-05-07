module.exports = {
  buttonAlignment: {
    label: 'Button Alignment Settings',
    type: 'object',
    fields: {
      add: {
        alignment: {
          label: 'Horizontal alignment',
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
          help: 'Set the horizontal alignment of the button within its container. This option is available only if you create one button.',
        },
      },
    },
  },
};
