const { standardizeFieldNames } = require('./standardizeFieldNames');
const {
  STANDARD_FORM_FIELD_NAMES,
} = require('../modules/@apostrophecms/shared-constants/ui/src/index');

describe('standardizeFieldNames', () => {
  let fieldNames = Object.values(STANDARD_FORM_FIELD_NAMES);

  beforeEach(() => {
    fieldNames = Object.values(STANDARD_FORM_FIELD_NAMES);
  });

  const createTestDoc = (items) => ({
    contents: {
      items,
    },
  });

  const expectFieldNames = (items, expectedNames) => {
    items.forEach((item, index) => {
      expect(item.fieldName).toBe(expectedNames[index]);
    });
  };

  it('should standardize field names according to the standard list', () => {
    const doc = createTestDoc([
      { fieldName: 'name' },
      { fieldName: 'email' },
      { fieldName: 'phone' },
    ]);

    standardizeFieldNames(doc);

    expectFieldNames(doc.contents.items, fieldNames);
  });

  it('should handle fewer items than standard names', () => {
    const doc = createTestDoc([{ fieldName: 'name' }, { fieldName: 'email' }]);

    standardizeFieldNames(doc);

    expectFieldNames(doc.contents.items, fieldNames);
    expect(doc.contents.items.length).toBe(2);
  });

  it('should handle more items than standard names', () => {
    const doc = createTestDoc([
      { fieldName: 'name' },
      { fieldName: 'email' },
      { fieldName: 'phone' },
      { fieldName: 'extra' },
    ]);

    standardizeFieldNames(doc);

    expectFieldNames(doc.contents.items.slice(0, 3), fieldNames);
    expect(doc.contents.items[3].fieldName).toBe('extra');
  });

  it('should handle empty items array', () => {
    const doc = createTestDoc([]);

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
    const doc = createTestDoc([
      { fieldName: fieldNames[0] },
      { fieldName: fieldNames[1] },
      { fieldName: fieldNames[2] },
    ]);

    standardizeFieldNames(doc);

    expectFieldNames(doc.contents.items, fieldNames);
  });

  it('should handle items without fieldName property', () => {
    const doc = createTestDoc([
      {},
      { fieldName: 'email' },
      { otherProp: 'value' },
    ]);

    standardizeFieldNames(doc);

    expect(doc.contents.items[0]).toEqual({});
    expect(doc.contents.items[1].fieldName).toBe(fieldNames[1]);
    expect(doc.contents.items[2]).toEqual({ otherProp: 'value' });
  });
});
