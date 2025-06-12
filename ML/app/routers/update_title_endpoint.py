
@app.post("/ai/update-title")
def update_title_endpoint(payload: TitleUpdateRequest):
    new_title = suggest_title_logic(payload.title)
    result = update_listing_title(payload.listing_id, new_title)
    return {"status": "ok", "result": result}
