import { createLogger, format, transports } from 'winston';

// Configure debug logger
const logger = createLogger({
    level: process.env.DEBUG_LEVEL || 'info',
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json()
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/debug.log' })
    ]
  });

  // Debug middleware
  const debugMiddleware = (req, res, next) => {
    if (process.env.DEBUG_MODE === 'true') {
      logger.debug({
        message: 'Request received',
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body
      });
    }
    next();
  };

  export { logger, debugMiddleware };