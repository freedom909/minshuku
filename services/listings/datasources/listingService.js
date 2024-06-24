class ListingService {
    constructor(db) {
      this.db = db;
    }
  
    async getAllListings() {
      const [rows] = await this.db.query('SELECT * FROM Listings');
      return rows;
    }
  
    async getListingById(listingId) {
      const [rows] = await this.db.query('SELECT * FROM Listings WHERE id = ?', [listingId]);
      return rows[0];
    }
  
    async createListing(listingData) {
      const { title, description, price } = listingData;
      const [result] = await this.db.query(
        'INSERT INTO Listings (title, description, price) VALUES (?, ?, ?)',
        [title, description, price]
      );
      return { id: result.insertId, ...listingData };
    }
  
    async updateListing(listingId, listingData) {
      const { title, description, price } = listingData;
      await this.db.query(
        'UPDATE Listings SET title = ?, description = ?, price = ? WHERE id = ?',
        [title, description, price, listingId]
      );
      return this.getListingById(listingId);
    }
  
    async deleteListing(listingId) {
      await this.db.query('DELETE FROM Listings WHERE id = ?', [listingId]);
      return { message: 'Listing deleted successfully' };
    }
  }
  
  export default ListingService;
  