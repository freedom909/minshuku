



let httpClient;

if (process.env.NODE_ENV === 'test') {
  // Dynamically import the mock in test mode
  httpClient = await import('./httpClient.js');
} else {
  // Import the actual httpClient for production or other environments
  httpClient = await import('../../frontend/src/httpClient.js');
}

export default httpClient;
