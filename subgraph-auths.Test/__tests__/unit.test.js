import fetch from 'node-fetch';

describe('Basic Fetch Functionality', () => {
  test('fetch should be defined', () => {
    expect(fetch).toBeDefined();
  });

  test('should fetch data from a public API', async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('completed');
  });
});