// import { RESTDataSource } from '@apollo/datasource-rest';

// export default class MachineAPI extends RESTDataSource {
//   constructor() {
//     super();
//     this.baseURL = 'http://localhost:8000/';
//   }

//   async suggestTitle(listingId) {
//     return this.post('listing/suggest', { listingId });
//   }

//   async suggestDescription(listingId) {
//     return this.post('description/suggest', { listingId });
//   }

//   async replyToReview(reviewId, reviewText) {
//     return this.post('review/reply', { reviewId, reviewText });
//   }
// }
