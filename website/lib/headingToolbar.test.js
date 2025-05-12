const config = require('./mainWidgets');
const headingToolbar = require('./headingToolbar');

describe('Widget Configuration', () => {
  it('should include @apostrophecms/rich-text with headingToolbar options', () => {
    const richText = config.groups.basic.widgets['@apostrophecms/rich-text'];
    expect(richText).toEqual(expect.objectContaining(headingToolbar));
  });

  it('should define all required widget groups', () => {
    expect(config.groups).toHaveProperty('basic');
    expect(config.groups).toHaveProperty('layout');
  });

  it('should include expected widgets in the basic group', () => {
    const widgets = config.groups.basic.widgets;
    expect(widgets).toHaveProperty('@apostrophecms/image');
    expect(widgets).toHaveProperty('case-studies-carousel');
    expect(widgets).toHaveProperty('@apostrophecms/rich-text');
  });

  it('should have columns set correctly', () => {
    expect(config.groups.basic.columns).toBe(2);
    expect(config.groups.layout.columns).toBe(2);
  });
});
