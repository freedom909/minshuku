import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.API_KEY;
function checkApiKey(req, res, next) {
    if (req.headers['x-api-key'] !== apiKey) {
      return res.status(401).json({ error: 'Unauthorized' });//error: 'Unauthorized'
    }
    next();
  }
  export default checkApiKey;