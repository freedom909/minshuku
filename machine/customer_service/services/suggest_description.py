import google.generativeai as genai
from machine.core.db_connection import GEMINI_API_KEY, DEFAULT_GEMINI_MODEL,mysql_pool,test_gemini
from google.generativeai import GenerativeModel
from machine.core.neo4j_client import get_listing_by_id

genai.configure(api_key=GEMINI_API_KEY)

def generate_description_suggestions(listing_id: str):
    # Step 1. Fetch listing data from MySQL
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
        text = response.text.strip()
        # Optional: handle JSON formatting if needed
        return {"suggestions": text}
    except Exception as e:
        return {"error": str(e)}

def suggest_description(id: str):
    listing = get_listing_by_id(id)
    print(f"Received request to suggest description for listingId={id}")
    if not listing:
        return f"Listing {id} not found in Neo4j."

    title = listing.get("title", "")
    description = listing.get("description", "")

    prompt = (
        f"Here is a listing titled '{title}' with the following description:\n"
        f"{description}\n\n"
        "Please suggest an improved, more engaging and SEO-friendly description."
    )

    try:
        suggestion = test_gemini(prompt)
        # Clean up JSON string
        if suggestion.startswith("```json"):
            suggestion = suggestion.replace("```json", "").replace("```", "").strip()
        return suggestion
    except Exception as e:
        return {"error": f"Failed to generate description: {str(e)}"}