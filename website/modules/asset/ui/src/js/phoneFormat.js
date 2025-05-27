// Format Eastern European numbers
const formatEasternEuropeanNumbers = (cleaned, digits) => {
  // Ukrainian format
  if (/^380\d{9}$/u.test(digits)) {
    return cleaned.replace(
      /^\+380(?<area>\d{2})(?<prefix>\d{3})(?<line>\d{4})$/u,
      '+380 $<area> $<prefix> $<line>',
    );
  }

  // Polish format
  if (/^48\d{9}$/u.test(digits)) {
    return cleaned.replace(
      /^\+48(?<area>\d{2})(?<prefix>\d{3})(?<line>\d{4})$/u,
      '+48 $<area> $<prefix> $<line>',
    );
  }

  return null;
};

// Format Western European numbers
const formatWesternEuropeanNumbers = (cleaned, digits) => {
  // UK format
  if (/^44\d{10}$/u.test(digits)) {
    return cleaned.replace(
      /^\+44(?<area>\d{4})(?<line>\d{6})$/u,
      '+44 $<area> $<line>',
    );
  }

  // German format
  if (/^49\d{10,11}$/u.test(digits)) {
    return cleaned.replace(
      /^\+49(?<area>\d{3,4})(?<prefix>\d{3,4})(?<line>\d{4})$/u,
      '+49 $<area> $<prefix> $<line>',
    );
  }

  // French format
  if (/^33\d{9}$/u.test(digits)) {
    return cleaned.replace(
      /^\+33(?<area>\d)(?<prefix>\d{2})(?<mid>\d{2})(?<line>\d{2})(?<end>\d{2})$/u,
      '+33 $<area> $<prefix> $<mid> $<line> $<end>',
    );
  }

  // Italian format
  if (/^39\d{9,10}$/u.test(digits)) {
    return cleaned.replace(
      /^\+39(?<prefix>\d{3})(?<line>\d{6,7})$/u,
      '+39 $<prefix> $<line>',
    );
  }

  return null;
};

// Format North American numbers
const formatNorthAmericanNumbers = (cleaned, digits) => {
  // US/Canada format
  if (/^1\d{10}$/u.test(digits)) {
    return cleaned.replace(
      /^\+1(?<area>\d{3})(?<prefix>\d{3})(?<line>\d{4})$/u,
      '+1 $<area> $<prefix> $<line>',
    );
  }

  return null;
};

// Format international numbers with country code
const formatInternationalNumber = (cleaned, digits) => {
  // Try specialized formatters first
  const eastEuropeanFormat = formatEasternEuropeanNumbers(cleaned, digits);
  if (eastEuropeanFormat) return eastEuropeanFormat;

  const westEuropeanFormat = formatWesternEuropeanNumbers(cleaned, digits);
  if (westEuropeanFormat) return westEuropeanFormat;

  const northAmericanFormat = formatNorthAmericanNumbers(cleaned, digits);
  if (northAmericanFormat) return northAmericanFormat;

  // General international format as fallback
  return cleaned.replace(
    /^\+(?<countryCode>\d+)(?<mid>\d{3})(?<end>\d{4})$/u,
    (_, countryCode, mid, end) => `+${countryCode} ${mid} ${end}`,
  );
};

// Format long national numbers (9–11 digits)
const formatLongNationalNumbers = (cleaned) => {
  // Standard 10-digit format (like US without country code)
  if (/^\d{10}$/u.test(cleaned)) {
    return cleaned.replace(
      /^(?<area>\d{3})(?<prefix>\d{3})(?<line>\d{4})$/u,
      '$<area> $<prefix> $<line>',
    );
  }

  // 11-digit format (like some European numbers)
  if (/^\d{11}$/u.test(cleaned)) {
    return cleaned.replace(
      /^(?<area>\d{3})(?<prefix>\d{4})(?<line>\d{4})$/u,
      '$<area> $<prefix> $<line>',
    );
  }

  // 9-digit format
  if (/^\d{9}$/u.test(cleaned)) {
    return cleaned.replace(
      /^(?<area>\d{3})(?<prefix>\d{3})(?<line>\d{3})$/u,
      '$<area> $<prefix> $<line>',
    );
  }

  // Ukrainian format without country code (starting with 0)
  if (/^0\d{9}$/u.test(cleaned)) {
    return cleaned.replace(
      /^(?<area>\d{3})(?<prefix>\d{3})(?<line>\d{4})$/u,
      '$<area> $<prefix> $<line>',
    );
  }

  return null;
};

// Format short national numbers (7–8 digits)
const formatShortNationalNumbers = (cleaned) => {
  // 8-digit format (common in some countries)
  if (/^\d{8}$/u.test(cleaned)) {
    return cleaned.replace(
      /^(?<prefix>\d{4})(?<line>\d{4})$/u,
      '$<prefix> $<line>',
    );
  }

  // Short local number format
  if (/^\d{7}$/u.test(cleaned)) {
    return cleaned.replace(
      /^(?<prefix>\d{3})(?<line>\d{4})$/u,
      '$<prefix> $<line>',
    );
  }

  return null;
};

// Format national numbers without country code
const formatNationalNumber = (cleaned) => {
  // Try specialized formatters first
  const longFormat = formatLongNationalNumbers(cleaned);
  if (longFormat) return longFormat;

  const shortFormat = formatShortNationalNumbers(cleaned);
  if (shortFormat) return shortFormat;

  // Default case - return cleaned input
  return cleaned;
};

// Main formatting function that delegates to specialized formatters
const formatPhoneNumber = (input) => {
  if (!input) return '';

  const cleaned = input.replace(/(?!^\+)\D/gu, '');

  if (cleaned.startsWith('+')) {
    const digits = cleaned.slice(1);
    return formatInternationalNumber(cleaned, digits);
  }

  return formatNationalNumber(cleaned);
};

// Function to attach formatting to form fields
const initPhoneFormatting = function () {
  // Find all phone input fields on the page
  const phoneInputs = document.querySelectorAll('input[name="phone-number"]');

  phoneInputs.forEach((input) => {
    // Handle input event
    input.addEventListener('input', function (event) {
      // Save cursor position
      const inputElement = event.target;
      const start = inputElement.selectionStart;
      const end = inputElement.selectionEnd;
      const initialLength = inputElement.value.length;

      // Format the entered number
      inputElement.value = formatPhoneNumber(inputElement.value);

      // Adjust cursor position after formatting
      const newLength = inputElement.value.length;
      const diff = newLength - initialLength;

      inputElement.setSelectionRange(start + diff, end + diff);
    });

    // Additional handling on blur for final formatting
    input.addEventListener('blur', function (event) {
      const inputElement = event.target;
      inputElement.value = formatPhoneNumber(inputElement.value);
    });
  });
};

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', initPhoneFormatting);

// Export the function for use in other modules
export { initPhoneFormatting, formatPhoneNumber };
