# createListing API

This endpoint creates a new listing and links categories and amenities in a single transaction.

## Route

- GraphQL mutation at `POST http://localhost:4001/graphql` (Gateway)
- Subgraph: Listings

## Mutation

```
mutation CreateListing($input: CreateListingInput!) {
  createListing(input: $input) {
    code
    success
    message
    listing {
      id
      title
      description
      price
      hostId
      locationId
      listingStatus
      locationType
      pictures
      numOfBeds
      isFeatured
      saleAmount
      checkInDate
      checkOutDate
      categories { id name type }
      amenities { id name }
    }
  }
}
```

## Example curl

```
curl -X POST http://localhost:4001/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{
    "query": "mutation CreateListing($input: CreateListingInput!) { createListing(input: $input) { code success message listing { id title price hostId locationId } } }",
    "variables": {
      "input": {
        "title": "Cozy Cabin",
        "description": "Woodland retreat",
        "pictures": ["https://img/1.jpg"],
        "numOfBeds": 2,
        "price": 120,
        "isFeatured": false,
        "saleAmount": 0,
        "checkInDate": "2025-11-20",
        "checkOutDate": "2025-11-22",
        "hostId": "host-1",
        "locationId": "loc-1",
        "listingStatus": "ACTIVE",
        "locationType": "HOUSE",
        "amenityIds": [1, "amenity-3"],
        "categoryIds": ["cat-1", 1]
      }
    }
  }'
```

## Response schema

```
type CreateListingResponse {
  code: Int!
  success: Boolean!
  message: String!
  listing: Listing
}
```

## Notes

- IDs for `categoryIds` and `amenityIds` are normalized to integers.
- Categories and amenities are linked inside the service transaction.
- When authentication is present, `hostId` is taken from the JWT; otherwise `input.hostId` is used.