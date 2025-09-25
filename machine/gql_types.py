import strawberry
from strawberry.federation import type as federation_type

# ✅ Output type (for Apollo Federation)
@federation_type(keys=["id"])
class Listing:
    id: strawberry.ID
    title: str
    description: str

# ✅ Input type (for resolver arguments)
@strawberry.input
class ListingInput:
    id: strawberry.ID
    title: str = ""
    description: str = ""
