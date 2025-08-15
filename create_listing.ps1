<#
.SYNOPSIS
   调用API生成MySQL房源记录
.DESCRIPTION
   使用指定用户凭据认证，创建关联amenities和locations的房源记录
.NOTES
   确保API端点已正确配置
#>

# 1. 用户登录获取Token
$loginUrl = "http://your-api-endpoint/auth/login"
$loginBody = @{
    email = "host1@example.com"
    password = "securepassword1"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token

    # 2. 创建房源记录
    $listingUrl = "http://your-api-endpoint/listings"
    $listingBody = @{
        title = "优质房源"
        description = "宽敞明亮的舒适空间"
        price = 299.99
        amenities = @(1, 3, 5)  # 关联设施ID
        location_id = 7         # 关联位置ID
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $listingResponse = Invoke-RestMethod -Uri $listingUrl -Method Post -Body $listingBody -Headers $headers
    Write-Host "创建成功！房源ID: $($listingResponse.id)"
} catch {
    Write-Host "操作失败: $_" -ForegroundColor Red
}