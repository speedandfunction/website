// Mock dependencies
const fs = require('fs');
jest.mock('fs');

jest.mock('path', () => ({
  resolve: jest.fn().mockImplementation((_, filePath) => filePath),
  dirname: jest.fn().mockImplementation((filePath) => filePath),
}));

// Mock for server constants module - this is for the success test
const mockServerModule = {
  init: jest.fn().mockImplementation((self) => {
    self.STANDARD_FORM_FIELD_NAMES = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
    };
  }),
};

// Register the success mock for the actual file
jest.mock(
  '../modules/@apostrophecms/shared-constants/index.js',
  () => mockServerModule,
);

describe('generate-constants.js', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the script from require cache
    delete require.cache[require.resolve('./generate_constants.js')];
  });

  test('successfully generates client-side constants', () => {
    // Run the script
    require('./generate_constants.js');

    // Check that the server module's init function was called
    expect(mockServerModule.init).toHaveBeenCalled();

    // Check that fs.writeFileSync was called with the right arguments
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '../modules/@apostrophecms/shared-constants/ui/src/index.js',
      expect.stringContaining('STANDARD_FORM_FIELD_NAMES'),
    );

    // Check content of generated file
    const fileContent = fs.writeFileSync.mock.calls[0][1];

    // Get the actual constants from the server module
    const serverConstantsPath =
      '../modules/@apostrophecms/shared-constants/index.js';
    const serverModule = require(serverConstantsPath);
    const self = {};
    serverModule.init(self);
    const { STANDARD_FORM_FIELD_NAMES } = self;

    // Verify that all constants are present in the generated file
    Object.values(STANDARD_FORM_FIELD_NAMES).forEach((value) => {
      expect(fileContent).toContain(value);
    });
  });

  test('handles errors properly', () => {
    // Force the server module's init to throw an error
    mockServerModule.init.mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    // Clear require cache to ensure script runs again
    jest.resetModules();
    delete require.cache[require.resolve('./generate_constants.js')];

    // Run the script which should now encounter the error
    expect(() => {
      require('./generate_constants.js');
    }).toThrow('Failed to generate client-side constants: Test error');
  });
});
