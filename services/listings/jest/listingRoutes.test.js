const request = require('supertest');
const express = require('express');
const { connectToDB } = require('../../../infrastructure/DB/database.js');
const ListingService =reqire('../datasources/listingService.js')
const listingRoutes = require('../routes/listingRoutes.js')

let app;

beforeAll(async () => {
  const db = await connectToDB();
  const listingService = new ListingService(db);

  app = express();
  app.use(express.json());
  app.use('/api', listingRoutes(listingService));
});

describe('Listing Routes', () => {
  it('should return 200 for a valid listing ID', async () => {
    const validListingId = 'listing-1'; // Ensure this ID exists in your database or adjust as needed
    const res = await request(app).get(`/api/listings/${validListingId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Object);
  });

  it('should return 404 for an invalid listing ID', async () => {
    const invalidListingId = 'invalid-id';
    const res = await request(app).get(`/api/listings/${invalidListingId}`);
    expect(res.statusCode).toBe(404);
  });
});
