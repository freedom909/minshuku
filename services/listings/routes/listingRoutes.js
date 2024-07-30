import express from 'express';
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing
} from '../controllers/listingController.js';

const listingRoutes = (listingService) => {
  const router = express.Router();

  router.get('/listings', (req, res) => getAllListings(req, res, listingService));
  router.get('/listings/:id', (req, res) => getListingById(req, res, listingService));
  router.post('/listings', (req, res) => createListing(req, res, listingService));
  router.put('/listings/:id', (req, res) => updateListing(req, res, listingService));
  router.delete('/listings/:id', (req, res) => deleteListing(req, res, listingService));

  return router;
};

export default listingRoutes;
