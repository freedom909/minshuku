Write-Host "=== Testing /listing/suggest ===" -ForegroundColor Cyan
curl.exe -X POST "http://127.0.0.1:8000/listing/suggest" `
  -H "Content-Type: application/json" `
  --data-raw '{"listingId":"listing-002"}'
Write-Host "`n"  # newline

Write-Host "=== Testing /description/suggest ===" -ForegroundColor Cyan
curl.exe -X POST "http://127.0.0.1:8000/description/suggest" `
  -H "Content-Type: application/json" `
  --data-raw '{"listingId":"listing-002"}'
Write-Host "`n"

Write-Host "=== Testing /review/reply ===" -ForegroundColor Cyan
curl.exe -X POST "http://127.0.0.1:8000/review/suggest" `
  -H "Content-Type: application/json" `
  --data-raw '{"reviewId":"review-001","content":"Great stay, very cozy and clean!"}'
Write-Host "`n"

Write-Host "=== All tests completed ===" -ForegroundColor Green
