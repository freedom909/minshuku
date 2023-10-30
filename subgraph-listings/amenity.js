// import { request } from 'graphql-request';

// async function getListing(listingId) {
//     try {
//       const endpoint = 'http://localhost:4003/listing/listingId'; // Replace with the appropriate GraphQL endpoint
  
//       const query = `
//         query Listing($listingId: ID!) {
//           listing(listingId: $listingId) {
//             id
//             title
//             description
//             costPerNight
//             hostId
//             locationType
//             numOfBeds
//             photoThumbnail
//             isFeatured
//             amenities {
//               id
//               category
//               name
//             }
//           }
//         }
//       `;
  
//       const variables = { listingId };
  
//       const data = await request(endpoint, query, variables);
  
//       //  console.log(data.listing);
//       return data.listing;
//     } catch (error) {
//       console.error(error);
//       throw error;
//     }
//   }