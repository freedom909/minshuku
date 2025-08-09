import axios from 'axios';

export default async function handler(req, res) {
  const { path } = req.query;
  const serviceUrl = `http://service1-backend.com/${path.join('/')}`;

  try {
    const response = await axios({
      method: req.method,
      url: serviceUrl,
      data: req.body,
      headers: req.headers,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal Server Error' });
  }
}