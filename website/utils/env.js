// Environment helper utility
const getEnv = (name) => {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Environment variable "${name}" is not defined`);
  }
  return value;
};

module.exports = {
  getEnv,
};
