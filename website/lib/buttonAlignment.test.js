const buttonAlignment = require('./buttonAlignment');

describe('buttonAlignment', () => {
  it('should export an object with buttonAlignment property', () => {
    expect(buttonAlignment).toHaveProperty('buttonAlignment');
  });

  it('should have correct label and type for buttonAlignment', () => {
    expect(buttonAlignment.buttonAlignment).toEqual(
      expect.objectContaining({
        label: 'Button Alignment Settings',
        type: 'object',
      }),
    );
  });

  it('should have fields property with add object', () => {
    expect(buttonAlignment.buttonAlignment).toHaveProperty('fields');
    expect(buttonAlignment.buttonAlignment.fields).toHaveProperty('add');
  });

  it('should have alignment field with correct properties', () => {
    const alignment = buttonAlignment.buttonAlignment.fields.add.alignment;

    expect(alignment).toEqual(
      expect.objectContaining({
        label: 'Horizontal alignment',
        type: 'radio',
        def: 'center',
        help: 'Set the horizontal alignment of the button within its container. This option is available only if you create one button.',
      }),
    );
  });

  it('should have correct alignment choices', () => {
    const choices =
      buttonAlignment.buttonAlignment.fields.add.alignment.choices;

    expect(choices).toHaveLength(3);
    expect(choices).toEqual([
      { label: 'Left', value: 'left' },
      { label: 'Center', value: 'center' },
      { label: 'Right', value: 'right' },
    ]);
  });

  it('should have center as default alignment', () => {
    const defaultAlignment =
      buttonAlignment.buttonAlignment.fields.add.alignment.def;
    expect(defaultAlignment).toBe('center');
  });
});
