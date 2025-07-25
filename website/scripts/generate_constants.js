/**
 * Script to generate client-side constants from server-side constants
 * This creates a true single source of truth by generating the client-side
 * constants file from the server-side constants definition.
 */

const fs = require('fs');
const path = require('path');

// Path to the server-side constants file
const serverConstantsPath = path.resolve(
  __dirname,
  '../modules/@apostrophecms/shared-constants/index.js',
);
// Path to the output client-side constants file
const clientConstantsPath = path.resolve(
  __dirname,
  '../modules/@apostrophecms/shared-constants/ui/src/index.js',
);

try {
  // Load the server-side constants module
  const serverModule = require(serverConstantsPath);

  // Create a temporary module instance to access the constants
  const self = {};
  serverModule.init(self);

  // Extract the constants we want to share
  const { STANDARD_FORM_FIELD_NAMES } = self;

  // Validate that constants were properly extracted
  if (!STANDARD_FORM_FIELD_NAMES) {
    throw new Error(
      'STANDARD_FORM_FIELD_NAMES not found in server constants module',
    );
  }

  // Helper function to safely stringify object with single quotes
  const stringifyWithSingleQuotes = (obj, indent = 2) => {
    const spaces = ' '.repeat(indent);
    const entries = Object.entries(obj)
      .map(
        ([key, value]) =>
          `${spaces}${key}: '${String(value).replace(/\\/gu, '\\\\').replace(/'/gu, "\\'")}'`,
      )
      .join(',\n');
    return `{\n${entries},\n${' '.repeat(indent - 2)}}`;
  };

  // Generate client-side constants file content
  const clientFileContent = `/*
 * Client-side access to shared constants.
 * IMPORTANT: This file is auto-generated from the server-side constants.
 * DO NOT EDIT THIS FILE DIRECTLY - modify the server-side constants instead.
 */

// Direct export of constants for import { STANDARD_FORM_FIELD_NAMES } from '...'
export const STANDARD_FORM_FIELD_NAMES = ${stringifyWithSingleQuotes(STANDARD_FORM_FIELD_NAMES)};

// Default export function for backwards compatibility
export default () => {
  return {
    STANDARD_FORM_FIELD_NAMES,
  };
};
`;

  // Ensure the output directory exists
  fs.mkdirSync(path.dirname(clientConstantsPath), { recursive: true });

  // Write the client-side constants file
  fs.writeFileSync(clientConstantsPath, clientFileContent);
} catch (error) {
  throw new Error(`Failed to generate client-side constants: ${error.message}`);
}
