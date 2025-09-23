import strawberry

@strawberry.type
class Listing:
    id: strawberry.ID
    title: str
    description: str


# ✅ Input version for arguments
@strawberry.input
class ListingInput:
    id: strawberry.ID
    title: str
    description: str
