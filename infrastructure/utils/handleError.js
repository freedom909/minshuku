// infrastructure/utils/handleError.js
const handleError = (error, context, operation) => {
    const { logger } = context;
    const errorDetails = {
      operation,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  
    if (process.env.DEBUG_MODE === 'true') {
      logger.error('GraphQL operation failed', errorDetails);
      return {
        message: error.message,
        code: error.code || 'INTERNAL_ERROR',
        stack: error.stack,
        timestamp: errorDetails.timestamp
      };
    }
  
    return {
      message: 'An error occurred',
      code: 'INTERNAL_ERROR'
    };
  };
  
  export default handleError;
  