# Locations Subgraph via Gateway

This document provides reproducible curl examples to interact with `subgraph-locations` through the GraphQL gateway, plus a quick architecture view and response shapes.

## Prerequisites
- Gateway running at `http://localhost:4000/graphql`.
- `subgraph-locations` server running at `http://localhost:4140/graphql`.
- If your gateway requires auth, include `Authorization: Bearer <token>`.

```mermaid
flowchart LR
    A[Frontend (Next.js)] -->|GraphQL| B[Gateway :4000]
    B --> C[subgraph-users]
    B --> D[subgraph-locations :4140]
    C --> E[(MySQL/Neo4j)]
    D --> E
```

## List Locations

Request:
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -X POST http://localhost:4000/graphql \
  -d '{
    "query": "query ListLocations { locations { id name country city state zip address latitude longitude radius units } }"
  }'
```

Sample response:
```json
{
  "data": {
    "locations": [
      {
        "id": "1",
        "name": "Downtown",
        "country": "US",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94103",
        "address": "123 Market St",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "radius": 5,
        "units": "km"
      }
    ]
  }
}
```

## Get Location by ID

Request:
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -X POST http://localhost:4000/graphql \
  -d '{
    "query": "query GetLocation($locationId: ID!) { locations(locationId: $locationId) { id name country city state zip address latitude longitude radius units } }",
    "variables": { "locationId": "1" }
  }'
```

## Create Location

Request:
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -X POST http://localhost:4000/graphql \
  -d '{
    "query": "mutation CreateLocation($input: CreateLocationInput!) { createLocation(input: $input) { code success message location { id name city state country zip address latitude longitude radius units } } }",
    "variables": {
      "input": {
        "name": "Shibuya",
        "latitude": 35.6595,
        "longitude": 139.7005,
        "radius": 3,
        "address": "2-24-12",
        "city": "Tokyo",
        "state": "Tokyo",
        "country": "JP",
        "zip": "150-0002",
        "units": "km"
      }
    }
  }'
```

## Update Location

Request:
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -X POST http://localhost:4000/graphql \
  -d '{
    "query": "mutation UpdateLocation($locationId: ID!, $location: UpdateLocationInput) { updateLocation(locationId: $locationId, location: $location) { code success message location { id name city state country zip address latitude longitude radius units } } }",
    "variables": {
      "locationId": "1",
      "location": { "name": "Shibuya Crossing" }
    }
  }'
```

## Delete Location

Request:
```bash
curl -s \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -X POST http://localhost:4000/graphql \
  -d '{
    "query": "mutation DeleteLocation($locationId: ID!) { deleteLocation(locationId: $locationId) }",
    "variables": { "locationId": "1" }
  }'
```

## Notes
- Environment: Frontend uses `NEXT_PUBLIC_GATEWAY_URL` and defaults to `http://localhost:4000/graphql`.
- If the gateway fails composition due to enum mismatch, align the `Role` enum across subgraphs. `subgraph-locations` now includes `PENDING_HOST` for consistency.
- On errors such as `net::ERR_CONNECTION_REFUSED`, ensure both the gateway and `subgraph-locations` servers are running.