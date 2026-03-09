// Environment helper utility
const getEnv = (name) => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable "${name}" is not defined`);
  }
  return value;
};

const getOptionalEnv = (name, defaultValue) => {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }
  return value;
};

module.exports = {
  getEnv,
  getOptionalEnv,
};
