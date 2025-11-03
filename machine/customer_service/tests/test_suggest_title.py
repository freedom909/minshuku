import pytest
from services.suggest_title import suggest_title_improvement
from unittest.mock import patch

@pytest.mark.parametrize("result, expected", [
    ([{"title": "Cozy yurt in Mraza"}], ["Cozy yurt in Mraza", "Optimized: Cozy yurt in Mraza (Enhanced for SEO)"]),
    ({"title": "Cozy yurt in Mraza"}, ["Cozy yurt in Mraza", "Optimized: Cozy yurt in Mraza (Enhanced for SEO)"]),
    (None, ["No title found for the listing. Ensure the listing exists and has a title."]),
    ([], ["No title found for the listing. Ensure the listing exists and has a title."]),
])
def test_suggest_title_improvement(result, expected):
    with patch("services.suggest_title.neo4j_query", return_value=result):
        response = suggest_title_improvement("listing-002")
        assert response["suggestions"] == expected

def test_suggest_title_improvement_invalid_id():
    with patch("services.suggest_title.neo4j_query", return_value=None):
        response = suggest_title_improvement(None)
        assert "Missing required parameter: listing_id" in response["detail"]