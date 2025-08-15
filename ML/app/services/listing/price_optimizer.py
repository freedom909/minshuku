import os
from typing import Dict, Any, List, Optional
import requests
import json
from datetime import datetime, timedelta

class PriceOptimizer:
    """
    价格优化服务，帮助房东设定有竞争力的价格
    
    功能：
    1. 分析市场上类似房源的价格
    2. 考虑季节性因素、特殊事件和需求波动
    3. 提供价格优化建议
    4. 预测不同价格点的预订率
    """
    
    def __init__(self, api_url: Optional[str] = None, llm_service_url: Optional[str] = None):
        """
        初始化价格优化服务
        
        Args:
            api_url: GraphQL API 的 URL，如果为 None，则使用环境变量或默认值
            llm_service_url: LLM 服务的 URL，如果为 None，则使用环境变量或默认值
        """
        self.api_url = api_url or os.getenv("SUBGRAPH_LISTINGS_API_URL", "http://localhost:4000/graphql")
        self.llm_service_url = llm_service_url or os.getenv("LLM_SERVICE_URL", "http://localhost:5000/api/llm")
    
    async def get_similar_listings(self, listing_id: str, radius_km: float = 5.0, limit: int = 10) -> List[Dict[str, Any]]:
        """
        获取指定半径内的类似房源
        
        Args:
            listing_id: 目标房源的 ID
            radius_km: 搜索半径（公里）
            limit: 返回结果的最大数量
            
        Returns:
            类似房源的列表
        """
        # 首先获取目标房源的详细信息
        target_listing = await self._get_listing_details(listing_id)
        
        if not target_listing:
            raise Exception(f"无法获取房源 ID {listing_id} 的详细信息")
        
        # 构建 GraphQL 查询，查找类似房源
        query = """
        query FindSimilarListings($lat: Float!, $lng: Float!, $radius: Float!, $numOfBeds: Int, $locationType: LocationType, $limit: Int!) {
          searchListingsByLocation(lat: $lat, lng: $lng, radius: $radius, limit: $limit) {
            id
            title
            description
            price
            numOfBeds
            locationType
            rating
            numOfReviews
            pictures
            amenities {
              id
              name
            }
          }
        }
        """
        
        variables = {
            "lat": target_listing.get("lat"),
            "lng": target_listing.get("lng"),
            "radius": radius_km,
            "numOfBeds": target_listing.get("numOfBeds"),
            "locationType": target_listing.get("locationType"),
            "limit": limit + 1  # 多获取一个，以便排除目标房源本身
        }
        
        try:
            response = requests.post(
                self.api_url,
                json={"query": query, "variables": variables},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            result = response.json()
            
            if "errors" in result:
                raise Exception(f"GraphQL Error: {json.dumps(result['errors'])}")
            
            # 过滤掉目标房源本身
            similar_listings = [
                listing for listing in result["data"]["searchListingsByLocation"]
                if listing["id"] != listing_id
            ]
            
            return similar_listings[:limit]
            
        except Exception as e:
            raise Exception(f"获取类似房源时出错: {str(e)}")
    
    async def analyze_market_prices(self, listing_id: str) -> Dict[str, Any]:
        """
        分析市场价格，提供统计数据
        
        Args:
            listing_id: 目标房源的 ID
            
        Returns:
            市场价格分析结果
        """
        similar_listings = await self.get_similar_listings(listing_id)
        
        if not similar_listings:
            return {
                "status": "error",
                "message": "未找到类似房源，无法进行市场价格分析"
            }
        
        # 获取目标房源的详细信息
        target_listing = await self._get_listing_details(listing_id)
        
        # 提取价格数据
        prices = [listing["price"] for listing in similar_listings]
        
        # 计算统计数据
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)
        median_price = sorted(prices)[len(prices) // 2]
        
        # 计算目标房源价格与市场的对比
        current_price = target_listing.get("price", 0)
        price_difference = current_price - avg_price
        price_difference_percentage = (price_difference / avg_price) * 100 if avg_price > 0 else 0
        
        return {
            "status": "success",
            "target_listing": {
                "id": target_listing.get("id"),
                "title": target_listing.get("title"),
                "current_price": current_price
            },
            "market_analysis": {
                "sample_size": len(similar_listings),
                "average_price": avg_price,
                "median_price": median_price,
                "min_price": min_price,
                "max_price": max_price,
                "price_range": max_price - min_price
            },
            "comparison": {
                "difference": price_difference,
                "difference_percentage": price_difference_percentage,
                "is_above_market": price_difference > 0,
                "is_below_market": price_difference < 0,
                "is_significantly_above": price_difference_percentage > 15,
                "is_significantly_below": price_difference_percentage < -15
            }
        }
    
    async def get_price_recommendations(self, listing_id: str) -> Dict[str, Any]:
        """
        获取价格优化建议
        
        Args:
            listing_id: 目标房源的 ID
            
        Returns:
            价格优化建议
        """
        # 获取市场价格分析
        market_analysis = await self.analyze_market_prices(listing_id)
        
        if market_analysis["status"] == "error":
            return market_analysis
        
        # 获取目标房源的详细信息
        target_listing = await self._get_listing_details(listing_id)
        
        # 准备 LLM 提示
        prompt = f"""
        作为一名短期租赁定价专家，请根据以下市场分析数据为房东提供价格优化建议：
        
        房源信息：
        - 标题: {target_listing.get('title')}
        - 当前价格: ${target_listing.get('price')} 每晚
        - 房间数: {target_listing.get('numOfBeds')} 间
        - 位置类型: {target_listing.get('locationType')}
        - 评分: {target_listing.get('rating', 'N/A')}
        - 评论数: {target_listing.get('numOfReviews', 0)}
        
        市场分析：
        - 样本大小: {market_analysis['market_analysis']['sample_size']} 个类似房源
        - 平均价格: ${market_analysis['market_analysis']['average_price']} 每晚
        - 中位价格: ${market_analysis['market_analysis']['median_price']} 每晚
        - 最低价格: ${market_analysis['market_analysis']['min_price']} 每晚
        - 最高价格: ${market_analysis['market_analysis']['max_price']} 每晚
        - 价格范围: ${market_analysis['market_analysis']['price_range']} 每晚
        
        价格对比：
        - 与市场平均价格的差异: ${market_analysis['comparison']['difference']} (${market_analysis['comparison']['difference_percentage']:.2f}%)
        - 是否显著高于市场: {'是' if market_analysis['comparison']['is_significantly_above'] else '否'}
        - 是否显著低于市场: {'是' if market_analysis['comparison']['is_significantly_below'] else '否'}
        
        请提供：
        1. 价格优化建议（是否应该调整价格，如何调整）
        2. 建议的价格范围（最低价格和最高价格）
        3. 提高预订率的定价策略
        4. 如何根据季节性和需求波动调整价格
        5. 其他可以提高房源竞争力的建议
        
        请以房东的角度提供实用、具体的建议，避免使用过于技术性的语言。
        """
        
        # 调用 LLM 服务获取建议
        try:
            llm_response = await self._call_llm_service(prompt)
            
            # 计算建议价格范围
            avg_price = market_analysis['market_analysis']['average_price']
            current_price = target_listing.get('price', 0)
            
            # 根据市场情况和当前价格计算建议价格范围
            if market_analysis['comparison']['is_significantly_above']:
                # 如果当前价格显著高于市场，建议降价
                suggested_min = max(avg_price * 0.9, market_analysis['market_analysis']['min_price'])
                suggested_max = avg_price * 1.05
            elif market_analysis['comparison']['is_significantly_below']:
                # 如果当前价格显著低于市场，建议涨价
                suggested_min = avg_price * 0.95
                suggested_max = min(avg_price * 1.1, market_analysis['market_analysis']['max_price'])
            else:
                # 如果价格在合理范围内，建议小幅调整
                suggested_min = current_price * 0.95
                suggested_max = current_price * 1.05
            
            return {
                "status": "success",
                "market_analysis": market_analysis['market_analysis'],
                "current_price": current_price,
                "suggested_price_range": {
                    "min": round(suggested_min, 2),
                    "max": round(suggested_max, 2),
                    "optimal": round((suggested_min + suggested_max) / 2, 2)
                },
                "recommendations": llm_response,
                "comparison": market_analysis['comparison']
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"获取价格建议时出错: {str(e)}",
                "market_analysis": market_analysis['market_analysis'],
                "comparison": market_analysis['comparison']
            }
    
    async def predict_booking_rates(self, listing_id: str, price_variations: List[float]) -> Dict[str, Any]:
        """
        预测不同价格点的预订率
        
        Args:
            listing_id: 目标房源的 ID
            price_variations: 要预测的价格变化列表（百分比，如 -10 表示降价 10%）
            
        Returns:
            不同价格点的预测预订率
        """
        # 获取目标房源的详细信息
        target_listing = await self._get_listing_details(listing_id)
        
        if not target_listing:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        current_price = target_listing.get("price", 0)
        
        # 计算不同价格点
        price_points = []
        for variation in price_variations:
            new_price = current_price * (1 + variation / 100)
            price_points.append({
                "variation": variation,
                "price": round(new_price, 2)
            })
        
        # 这里我们使用一个简化的模型来预测预订率
        # 在实际应用中，这应该基于历史数据和机器学习模型
        predictions = []
        base_booking_rate = 0.7  # 假设当前价格的基础预订率为 70%
        
        for point in price_points:
            # 简化的预订率计算模型
            # 价格每增加 10%，预订率下降约 5-15%
            # 价格每降低 10%，预订率上升约 5-10%
            variation = point["variation"]
            
            if variation > 0:
                # 价格上涨，预订率下降
                booking_rate_change = -0.1 * (variation / 10)
            else:
                # 价格下降，预订率上升
                booking_rate_change = 0.075 * (abs(variation) / 10)
            
            # 确保预订率在合理范围内
            predicted_rate = max(0.1, min(0.95, base_booking_rate + booking_rate_change))
            
            # 计算预计月收入
            monthly_income = point["price"] * 30 * predicted_rate
            
            predictions.append({
                "price": point["price"],
                "variation": point["variation"],
                "predicted_booking_rate": round(predicted_rate, 2),
                "estimated_monthly_income": round(monthly_income, 2)
            })
        
        # 找出预计月收入最高的价格点
        optimal_price_point = max(predictions, key=lambda x: x["estimated_monthly_income"])
        
        return {
            "status": "success",
            "current_price": current_price,
            "predictions": predictions,
            "optimal_price_point": optimal_price_point
        }
    
    async def get_seasonal_pricing_strategy(self, listing_id: str) -> Dict[str, Any]:
        """
        获取季节性定价策略
        
        Args:
            listing_id: 目标房源的 ID
            
        Returns:
            季节性定价策略
        """
        # 获取目标房源的详细信息
        target_listing = await self._get_listing_details(listing_id)
        
        if not target_listing:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        current_price = target_listing.get("price", 0)
        
        # 获取房源位置信息，用于确定季节性因素
        location = {
            "lat": target_listing.get("lat"),
            "lng": target_listing.get("lng"),
            "locationType": target_listing.get("locationType")
        }
        
        # 定义季节和特殊时期的价格调整因子
        # 这些因子应该基于位置和历史数据进行定制
        # 在实际应用中，这些应该来自数据分析
        seasons = [
            {"name": "春季 (3-5月)", "factor": 1.0},
            {"name": "夏季 (6-8月)", "factor": 1.2},
            {"name": "秋季 (9-11月)", "factor": 1.0},
            {"name": "冬季 (12-2月)", "factor": 0.9}
        ]
        
        # 根据房源类型调整季节因子
        if location["locationType"] == "BEACH":
            # 海滩房源在夏季更受欢迎
            seasons[1]["factor"] = 1.4  # 夏季
            seasons[3]["factor"] = 0.8  # 冬季
        elif location["locationType"] == "MOUNTAIN":
            # 山区房源在冬季（滑雪季）和秋季（赏叶）更受欢迎
            seasons[2]["factor"] = 1.2  # 秋季
            seasons[3]["factor"] = 1.3  # 冬季
        
        # 特殊时期（节假日等）
        special_periods = [
            {"name": "新年", "dates": "12月30日 - 1月2日", "factor": 1.5},
            {"name": "春节", "dates": "农历正月初一前后一周", "factor": 1.4},
            {"name": "劳动节", "dates": "4月30日 - 5月5日", "factor": 1.3},
            {"name": "国庆节", "dates": "9月30日 - 10月7日", "factor": 1.4},
            {"name": "圣诞节", "dates": "12月23日 - 12月26日", "factor": 1.4}
        ]
        
        # 周末与工作日的价格差异
        weekday_weekend = [
            {"name": "工作日 (周一至周四)", "factor": 0.9},
            {"name": "周末 (周五至周日)", "factor": 1.2}
        ]
        
        # 生成季节性价格建议
        seasonal_prices = []
        for season in seasons:
            seasonal_prices.append({
                "season": season["name"],
                "suggested_price": round(current_price * season["factor"], 2),
                "adjustment_factor": season["factor"]
            })
        
        # 生成特殊时期价格建议
        special_period_prices = []
        for period in special_periods:
            special_period_prices.append({
                "period": period["name"],
                "dates": period["dates"],
                "suggested_price": round(current_price * period["factor"], 2),
                "adjustment_factor": period["factor"]
            })
        
        # 生成周末与工作日价格建议
        weekday_weekend_prices = []
        for period in weekday_weekend:
            weekday_weekend_prices.append({
                "period": period["name"],
                "suggested_price": round(current_price * period["factor"], 2),
                "adjustment_factor": period["factor"]
            })
        
        # 准备 LLM 提示，获取更详细的季节性定价策略建议
        prompt = f"""
        作为短期租赁定价专家，请为以下房源提供详细的季节性定价策略：
        
        房源信息：
        - 标题: {target_listing.get('title')}
        - 当前价格: ${current_price} 每晚
        - 位置类型: {target_listing.get('locationType')}
        
        基于分析，我们建议以下季节性价格调整：
        
        季节性价格：
        {', '.join([f"{p['season']}: ${p['suggested_price']}" for p in seasonal_prices])}
        
        特殊时期价格：
        {', '.join([f"{p['period']} ({p['dates']}): ${p['suggested_price']}" for p in special_period_prices])}
        
        周末与工作日价格：
        {', '.join([f"{p['period']}: ${p['suggested_price']}" for p in weekday_weekend_prices])}
        
        请提供：
        1. 如何实施这些季节性价格调整的具体建议
        2. 提前多久调整价格以获得最佳效果
        3. 如何监控和评估价格调整的效果
        4. 其他可以优化季节性定价策略的建议
        
        请以房东的角度提供实用、具体的建议。
        """
        
        try:
            llm_response = await self._call_llm_service(prompt)
            
            return {
                "status": "success",
                "current_price": current_price,
                "seasonal_pricing": {
                    "seasons": seasonal_prices,
                    "special_periods": special_period_prices,
                    "weekday_weekend": weekday_weekend_prices
                },
                "recommendations": llm_response
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"获取季节性定价策略时出错: {str(e)}",
                "seasonal_pricing": {
                    "seasons": seasonal_prices,
                    "special_periods": special_period_prices,
                    "weekday_weekend": weekday_weekend_prices
                }
            }
    
    async def _get_listing_details(self, listing_id: str) -> Dict[str, Any]:
        """
        获取房源的详细信息
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            房源的详细信息
        """
        query = """
        query GetListing($id: ID!) {
          listing(id: $id) {
            id
            title
            description
            price
            numOfBeds
            locationType
            lat
            lng
            rating
            numOfReviews
            pictures
            amenities {
              id
              name
            }
          }
        }
        """
        
        variables = {"id": listing_id}
        
        try:
            response = requests.post(
                self.api_url,
                json={"query": query, "variables": variables},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            result = response.json()
            
            if "errors" in result:
                raise Exception(f"GraphQL Error: {json.dumps(result['errors'])}")
            
            return result["data"]["listing"]
            
        except Exception as e:
            raise Exception(f"获取房源详细信息时出错: {str(e)}")
    
    async def _call_llm_service(self, prompt: str) -> str:
        """
        调用 LLM 服务获取生成内容
        
        Args:
            prompt: 提示文本
            
        Returns:
            LLM 生成的内容
        """
        try:
            response = requests.post(
                self.llm_service_url,
                json={"prompt": prompt},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            result = response.json()
            
            if "error" in result:
                raise Exception(f"LLM Service Error: {result['error']}")
            
            return result.get("response", "")
            
        except Exception as e:
            raise Exception(f"调用 LLM 服务时出错: {str(e)}")