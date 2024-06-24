import express from 'express';
import { connectToDB } from '../../infrastructure/DB/database.js';
import ListingService from './datasources/listingService.js';
import listingRoutes from './routes/listingRoutes.js';

const app = express();

app.use(express.json());

const initializeServices = async () => {
  const db = await connectToDB();
  const listingService = new ListingService(db);

  // Inject listingService into routes
  app.use('/api', listingRoutes(listingService));
};

initializeServices().catch(err => {
  console.error('Failed to initialize services:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
