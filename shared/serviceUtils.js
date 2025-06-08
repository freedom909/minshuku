// Service utility functions

// Function to handle errors in services
function handleServiceError(error, serviceName) {
  console.error(`Error in ${serviceName}:`, error);
  throw new Error(`Service ${serviceName} failed: ${error.message}`);
}

// Function to validate input data
function validateInput(data, schema) {
  const { error } = schema.validate(data);
  if (error) {
    throw new Error(`Input validation failed: ${error.details[0].message}`);
  }
  return true;
}

module.exports = {
  handleServiceError,
  validateInput
};