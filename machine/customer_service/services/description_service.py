def suggest_description(listing_id: str) -> str:
    # TODO: fetch description from DB for listing_id
    original_description = f"This is the original description for listing {listing_id}."
    suggestions = [
        f"{original_description} Enjoy a luxurious stay with all amenities.",
        f"{original_description} Perfect for cozy getaways and adventures.",
    ]
    return suggestions[0]

# services/descriptions.py
async def generate_description_suggestions(listingId: str) -> str:
    # Example dummy implementation
    return await f"Suggested description for listing {listingId}"




