import requests

def update_listing_title(listing_id, new_title):
    query = """
    mutation UpdateListing($id: ID!, $details: ListingInput!) {
      updateListing(listingId: $id, listingDetails: $details) {
        id
        title
      }
    }
    """
    variables = {
        "id": listing_id,
        "details": {
            "title": new_title,
            # Add required fields here (use values from MySQL sample if needed)
            "description": "Updated by AI",
            "pictures": [{"url": "https://example.com/updated.jpg"}],
            "numOfBeds": 2,
            "costPerNight": 150.0,
            "locationType": "APARTMENT",
            "hostId": "user-6",
            "amenities": {"id": "amenity-1", "name": "WiFi"},
            "location": {"city": "Mraza", "country": "Mars"},
            "status": "ACTIVE",
            "host": {
                "id": "user-6",
                "name": "AI Host",
                "picture": "",
                "description": "Host Description",
                "nickname": "AI"
            },
            "priceRange": {"min": 100, "max": 200},
            "totalCostRange": {"min": 100, "max": 200},
            "locationFilter": {"city": "Mraza", "country": "Mars"},
            "distance": 0.21
        }
    }
    response = requests.post(
        "http://localhost:4040/graphql",
        json={"query": query, "variables": variables},
        headers={"Content-Type": "application/json"}
    )
    return response.json()
