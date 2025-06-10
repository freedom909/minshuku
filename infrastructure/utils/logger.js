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



  export default logger;