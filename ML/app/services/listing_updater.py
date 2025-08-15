import requests
import json
import os
from typing import Dict, Any, Optional

class ListingUpdater:
    """
    服务类，用于与 subgraph-listings API 通信，
    特别是调用 updateListing 方法
    """
    
    def __init__(self, api_url: Optional[str] = None):
        """
        初始化 ListingUpdater 服务
        
        Args:
            api_url: subgraph-listings API 的 URL，如果为 None，则使用环境变量或默认值
        """
        self.api_url = api_url or os.getenv("SUBGRAPH_LISTINGS_API_URL", "http://localhost:4000/graphql")
    
    async def update_listing(self, listing_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        调用 subgraph-listings API 的 updateListing 方法
        
        Args:
            listing_id: 要更新的 listing 的 ID
            update_data: 包含要更新的字段和值的字典
        
        Returns:
            API 响应的 JSON 数据
        
        Raises:
            Exception: 如果 API 调用失败
        """
        # 如果更新数据包含 price，将其重命名为 price
        if "price" in update_data:
            update_data["price"] = update_data.pop("price")
        
        # 确保更新数据中包含必需的 pictures 字段
        if "pictures" not in update_data:
            # 获取当前 listing 的图片信息
            get_listing_query = """
            query GetListing($id: ID!) {
                listing(id: $id) {
                    pictures
                }
            }
            """
            try:
                response = requests.post(
                    self.api_url,
                    json={
                        "query": get_listing_query,
                        "variables": {"id": listing_id}
                    },
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                result = response.json()
                if "errors" in result:
                    raise Exception(f"GraphQL Error: {json.dumps(result['errors'])}")
                pictures = result["data"]["listing"]["pictures"]
                update_data["pictures"] = pictures
            except Exception as e:
                raise Exception(f"Error fetching current listing pictures: {str(e)}")
        
        # 构建 GraphQL 变量
        variables = {
            "listingId": listing_id,
            "listing": update_data
        }
        
        # 构建 GraphQL 查询
        query = """
        mutation UpdateListing($listingId: ID!, $listing: UpdateListingInput!) {
          updateListing(listingId: $listingId, listing: $listing) {
            success
            message
          }
        }
        """
        
        # 发送请求到 GraphQL API
        try:
            response = requests.post(
                self.api_url,
                json={
                    "query": query,
                    "variables": variables
                },
                headers={"Content-Type": "application/json"}
            )
            
            # 检查响应状态
            response.raise_for_status()
            
            # 解析响应
            result = response.json()
            
            # 检查 GraphQL 错误
            if "errors" in result:
                raise Exception(f"GraphQL Error: {json.dumps(result['errors'])}")
            
            return result["data"]
        
        except requests.RequestException as e:
            raise Exception(f"API Request Error: {str(e)}")
        except json.JSONDecodeError:
            raise Exception("Invalid JSON response from API")
        except Exception as e:
            raise Exception(f"Error updating listing: {str(e)}")