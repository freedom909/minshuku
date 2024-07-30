import axios from 'axios';

// Create an Axios instance with custom settings
const httpClient = axios.create({
  baseURL: 'https://localhost:3000', // Replace with your API base URL
  timeout: 5000, // Request timeout (in milliseconds)
  headers: {
    'Content-Type': 'application/json',
    // Add any other default headers you need
  },
});

// Optionally, you can add interceptors for request/response handling
httpClient.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response;
  },
  (error) => {
    // Do something with response error
    return Promise.reject(error);
  }
);

export default httpClient;
