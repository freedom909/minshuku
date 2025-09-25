import os
import mysql.connector
import google.generativeai as genai
import strawberry
from strawberry.fastapi import GraphQLRouter
from fastapi import FastAPI, HTTPException

# --------------------------
# ENV setup
# --------------------------
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "princess")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "air")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCjouL_HF0oK4e28F_GALGVPrc-2tIRdDE")
genai.configure(api_key=GEMINI_API_KEY)



# --------------------------
# DB helper
# --------------------------
def get_listing_from_db(listing_id: str):
    conn = mysql.connector.connect(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, title, description FROM listings WHERE id = %s", (listing_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return row


# --------------------------
# GraphQL schema
# --------------------------
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
        
        Please suggest a SINGLE improved title (max 10 words) that is clear,
engaging, and attractive to potential guests. Return ONLY the title text,
without explanations or formatting.
        """


        try:
            model = genai.GenerativeModel("gemini-1.5-flash")  # or gemini-1.5-pro
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini error: {str(e)}")

schema = strawberry.Schema(query=Query)

# --------------------------
# FastAPI app
# --------------------------
app = FastAPI()
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")
