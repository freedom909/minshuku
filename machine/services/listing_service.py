def suggest_title(listing_id: str) -> str:
    # TODO: fetch title from DB for listing_id
    original_title = f"Listing {listing_id}"
    suggestions = [
        f"Luxury Stay: {original_title}",
        f"Cozy Escape · {original_title}",
        f"Adventure Awaits at {original_title}",
    ]
    return suggestions[0]
