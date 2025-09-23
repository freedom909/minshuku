import strawberry
from machine.gql_types import Listing, ListingInput


@strawberry.type
class Query:
    @strawberry.field
    def recommended_title(self, listing: ListingInput) -> str:
        # listing is now an input type, valid for args
        return f"Recommended: {listing.title}"


schema_query = Query
