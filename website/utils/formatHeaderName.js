const formatHeaderName = (key) => {
  if (typeof key !== 'string' || !key) {
    return '';
  }

  return key
    .split('-')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

module.exports = { formatHeaderName };
