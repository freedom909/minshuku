import strawberry
from machine.gql_types import Listing, ListingInput
from services.listingService import ListingService
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
client = genai(api_key=os.getenv("GEMINI_API_KEY"))

@strawberry.type
@strawberry.type
class Query:
    @strawberry.field
    def suggest_title_improvements(self, listing_id: str) -> str:
        listing = get_listing_from_db(listing_id)
        if not listing:
            raise HTTPException(status_code=404, detail=f"Listing {listing_id} not found")

        prompt = f"""
        The current listing title is: "{listing['title']}".
        Description: "{listing['description']}".
        
        Please suggest a more attractive, customer-friendly title that will increase clicks and bookings.
        """

        try:
            model = genai.GenerativeModel("gemini-1.5-flash")  # or gemini-1.5-pro
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")

    @strawberry.field
    async def recommended_title(
        self,
        listing: ListingInput,
        listing_service: ListingService,  # injected service
    ) -> str:
        # Use provided title/description if available
        title = listing.title
        description = listing.description

        # Fetch from DB if missing
        if not title or not description:
            db_listing = await listing_service.get_listing_by_id(listing.id)
            if not db_listing:
                raise ValueError(f"Listing {listing.id} not found")
            title = db_listing.title
            description = db_listing.description

        # Generate improved title with ChatGPT
        prompt = f"""
        You are an expert at writing attractive short listing titles for Airbnb-style listings.
        Original title: "{title}"
        Description: "{description}"

        Suggest a more engaging, customer-friendly title.
        """
        response = client.chat.completions.create(
            model="gemini-1.5-flash",
            messages=[
        {"role": "system", "content": "You are a helpful assistant for improving Airbnb listing titles."},
        {"role": "user", "content": prompt}
    ],
            max_tokens=50,
            temperature=0.7,
        )
        suggestion = response.choices[0].message.content.strip()
        return suggestion

schema_query = Query
