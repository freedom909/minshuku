# tasks/generateDescriptionSuggestions.py
from google.generativeai import GenerativeModel
from machine.core.db_connection import DEFAULT_GEMINI_MODEL,mysql_pool

def generate_description_suggestions(listing_id: str):
    # Step 1. Fetch listing data
    conn = mysql_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT title, description FROM listings WHERE id = %s", (listing_id,))
    listing = cursor.fetchone()
    cursor.close()
    conn.close()

    if not listing:
        return {"error": f"Listing {listing_id} not found."}

    title = listing["title"]
    current_desc = listing["description"]

    # Step 2. Generate improved description via Gemini
    model = GenerativeModel(DEFAULT_GEMINI_MODEL)
    prompt = f"""
    The listing title is: "{title}"
    The current description is:
    "{current_desc}"

    Please generate 2–3 improved, attractive Airbnb-style descriptions
    that are clear, natural, and focus on traveler emotions.
    Respond as a JSON list of strings, like:
    ["...", "...", "..."]
    """

    response = model.generate_content(prompt)

    # Step 3. Parse and return
    try:
        import json
        suggestions = json.loads(response.text.strip())
        return {"suggestions": suggestions}
    except Exception as e:
        return {"error": str(e)}
