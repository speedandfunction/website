const {
  stripHtml,
  areaToString,
  updateTestimonialFeedback,
  updateTableRowsDescriptions,
} = require('./migrate-field-type.utils');

describe('stripHtml', () => {
  test('removes <p> and <span> tags and their closing tags', () => {
    expect(stripHtml('<p>Text</p>')).toBe('Text');
    expect(stripHtml('<span>Text</span>')).toBe('Text');
    expect(stripHtml('<p><span>Nested</span></p>')).toBe('Nested');
    expect(stripHtml('No tags')).toBe('No tags');
  });

  test('returns empty string for non-string input', () => {
    expect(stripHtml(null)).toBe('');
    expect(stripHtml(undefined)).toBe('');
    expect(stripHtml(123)).toBe('');
  });
});

describe('areaToString', () => {
  test('returns string as is (after stripHtml)', () => {
    expect(areaToString('<p>abc</p>')).toBe('abc');
  });

  test('joins items content and strips HTML', () => {
    const area = {
      items: [{ content: '<p>foo</p>' }, { content: '<span>bar</span>' }],
    };
    expect(areaToString(area)).toBe('foo bar');
  });

  test('returns empty string for empty or invalid area', () => {
    expect(areaToString({ items: [] })).toBe('');
    expect(areaToString({})).toBe('');
    expect(areaToString(null)).toBe('');
  });
});

describe('updateTestimonialFeedback', () => {
  test('updates feedback if it is an area object', async () => {
    const collection = { updateOne: jest.fn().mockResolvedValue({}) };
    const doc = { _id: 1, feedback: { items: [{ content: '<p>abc</p>' }] } };
    const result = await updateTestimonialFeedback(collection, doc, '_id');
    expect(result).toBe(1);
    expect(collection.updateOne).toHaveBeenCalledWith(
      { _id: 1 },
      { $set: { feedback: 'abc' } },
    );
  });

  test('does not update if feedback is already string', async () => {
    const collection = { updateOne: jest.fn() };
    const doc = { _id: 2, feedback: 'already string' };
    const result = await updateTestimonialFeedback(collection, doc, '_id');
    expect(result).toBe(0);
    expect(collection.updateOne).not.toHaveBeenCalled();
  });
});

describe('updateTableRowsDescriptions', () => {
  test('updates table row descriptions if they are area objects', async () => {
    const collection = { updateOne: jest.fn().mockResolvedValue({}) };
    const doc = {
      _id: 1,
      main: {
        items: [
          {
            type: 'table',
            rows: [
              { description: { items: [{ content: '<p>foo</p>' }] } },
              { description: 'bar' },
            ],
          },
        ],
      },
    };
    const result = await updateTableRowsDescriptions(collection, doc, '_id');
    expect(result).toBe(1);
    expect(collection.updateOne).toHaveBeenCalledWith(
      { _id: 1 },
      {
        $set: {
          'main.items': [
            {
              type: 'table',
              rows: [{ description: 'foo' }, { description: 'bar' }],
            },
          ],
        },
      },
    );
  });

  test('does not update if no area descriptions found', async () => {
    const collection = { updateOne: jest.fn() };
    const doc = {
      _id: 2,
      main: { items: [{ type: 'table', rows: [{ description: 'plain' }] }] },
    };
    const result = await updateTableRowsDescriptions(collection, doc, '_id');
    expect(result).toBe(0);
    expect(collection.updateOne).not.toHaveBeenCalled();
  });
});
