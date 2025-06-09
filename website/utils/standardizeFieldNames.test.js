const { standardizeFieldNames } = require('./standardizeFieldNames');
const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../modules/@apostrophecms/shared-constants/ui/src/index');

describe('standardizeFieldNames', () => {
  it('should standardize field names according to the standard list', () => {
    const fieldNames = Object.values(STANDARD_FORM_FIELD_NAMES);
    const doc = {
      contents: {
        items: [
          { fieldName: 'name' },
          { fieldName: 'email' },
          { fieldName: 'phone' },
        ],
      },
    };

    standardizeFieldNames(doc);

    expect(doc.contents.items[0].fieldName).toBe(fieldNames[0]);
    expect(doc.contents.items[1].fieldName).toBe(fieldNames[1]);
    expect(doc.contents.items[2].fieldName).toBe(fieldNames[2]);
  });

  it('should handle fewer items than standard names', () => {
    const fieldNames = Object.values(STANDARD_FORM_FIELD_NAMES);
    const doc = {
      contents: {
        items: [{ fieldName: 'name' }, { fieldName: 'email' }],
      },
    };

    standardizeFieldNames(doc);

    expect(doc.contents.items[0].fieldName).toBe(fieldNames[0]);
    expect(doc.contents.items[1].fieldName).toBe(fieldNames[1]);
    expect(doc.contents.items.length).toBe(2);
  });

  it('should handle more items than standard names', () => {
    const fieldNames = Object.values(STANDARD_FORM_FIELD_NAMES);
    const doc = {
      contents: {
        items: [
          { fieldName: 'name' },
          { fieldName: 'email' },
          { fieldName: 'phone' },
          { fieldName: 'extra' },
        ],
      },
    };

    standardizeFieldNames(doc);

    expect(doc.contents.items[0].fieldName).toBe(fieldNames[0]);
    expect(doc.contents.items[1].fieldName).toBe(fieldNames[1]);
    expect(doc.contents.items[2].fieldName).toBe(fieldNames[2]);
    expect(doc.contents.items[3].fieldName).toBe('extra');
  });

  it('should handle empty items array', () => {
    const doc = {
      contents: {
        items: [],
      },
    };

    standardizeFieldNames(doc);

    expect(doc.contents.items).toEqual([]);
  });

  it('should handle missing contents', () => {
    const doc = {};

    standardizeFieldNames(doc);

    expect(doc).toEqual({});
  });

  it('should handle null doc', () => {
    const doc = null;

    standardizeFieldNames(doc);

    expect(doc).toBeNull();
  });

  it('should not modify field names that already match standard names', () => {
    const fieldNames = Object.values(STANDARD_FORM_FIELD_NAMES);
    const doc = {
      contents: {
        items: [
          { fieldName: fieldNames[0] },
          { fieldName: fieldNames[1] },
          { fieldName: fieldNames[2] },
        ],
      },
    };

    standardizeFieldNames(doc);

    expect(doc.contents.items[0].fieldName).toBe(fieldNames[0]);
    expect(doc.contents.items[1].fieldName).toBe(fieldNames[1]);
    expect(doc.contents.items[2].fieldName).toBe(fieldNames[2]);
  });

  it('should handle items without fieldName property', () => {
    const fieldNames = Object.values(STANDARD_FORM_FIELD_NAMES);
    const doc = {
      contents: {
        items: [{}, { fieldName: 'email' }, { otherProp: 'value' }],
      },
    };

    standardizeFieldNames(doc);

    expect(doc.contents.items[0]).toEqual({});
    expect(doc.contents.items[1].fieldName).toBe(fieldNames[1]);
    expect(doc.contents.items[2]).toEqual({ otherProp: 'value' });
  });
});
