import os
from typing import Dict, Any, List, Optional
import requests
import json

class TitleOptimizer:
    """
    标题优化服务，帮助房东创建更吸引人的房源标题
    
    功能：
    1. 分析当前标题的优缺点
    2. 生成优化建议
    3. 提供多个标题建议
    4. 分析标题关键词效果
    5. 考虑目标客户群的偏好
    """
    
    def __init__(self, api_url: Optional[str] = None, llm_service_url: Optional[str] = None):
        """
        初始化标题优化服务
        
        Args:
            api_url: GraphQL API 的 URL，如果为 None，则使用环境变量或默认值
            llm_service_url: LLM 服务的 URL，如果为 None，则使用环境变量或默认值
        """
        self.api_url = api_url or os.getenv("SUBGRAPH_LISTINGS_API_URL", "http://localhost:4000/graphql")
        self.llm_service_url = llm_service_url or os.getenv("LLM_SERVICE_URL", "http://localhost:5000/api/llm")
    
    async def analyze_current_title(self, listing_id: str) -> Dict[str, Any]:
        """
        分析当前房源标题的优缺点
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            标题分析结果
        """
        # 获取房源详细信息
        listing_details = await self._get_listing_details(listing_id)
        
        if not listing_details:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        current_title = listing_details.get("title", "")
        
        if not current_title:
            return {
                "status": "error",
                "message": "房源没有标题"
            }
        
        # 准备 LLM 提示
        prompt = f"""
        作为短期租赁标题优化专家，请分析以下房源标题的优缺点：
        
        房源标题：{current_title}
        
        房源信息：
        - 类型: {listing_details.get('locationType')}
        - 房间数: {listing_details.get('numOfBeds')} 间
        - 价格: ${listing_details.get('price')} 每晚
        - 位置特点: {self._get_location_features(listing_details)}
        
        请提供：
        1. 标题的优点（吸引人的元素）
        2. 标题的缺点（需要改进的地方）
        3. 关键词使用分析
        4. 标题长度和可读性评估
        5. SEO 和搜索友好度分析
        
        请以房东的角度提供具体、实用的分析。
        """
        
        try:
            analysis = await self._call_llm_service(prompt)
            
            # 进行关键词分析
            keywords = await self._analyze_keywords(current_title, listing_details)
            
            return {
                "status": "success",
                "listing_id": listing_id,
                "current_title": current_title,
                "analysis": analysis,
                "keywords": keywords,
                "metrics": {
                    "length": len(current_title),
                    "word_count": len(current_title.split()),
                    "has_numbers": any(c.isdigit() for c in current_title),
                    "has_special_chars": any(not c.isalnum() and not c.isspace() for c in current_title)
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"分析标题时出错: {str(e)}"
            }
    
    async def generate_title_suggestions(self, listing_id: str, num_suggestions: int = 5) -> Dict[str, Any]:
        """
        生成多个标题建议
        
        Args:
            listing_id: 房源的 ID
            num_suggestions: 要生成的建议数量
            
        Returns:
            标题建议列表
        """
        # 获取房源详细信息
        listing_details = await self._get_listing_details(listing_id)
        
        if not listing_details:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        # 获取成功房源的标题特征
        successful_patterns = await self._get_successful_title_patterns(listing_details.get("locationType"))
        
        # 准备 LLM 提示
        prompt = f"""
        作为短期租赁标题优化专家，请为以下房源生成 {num_suggestions} 个吸引人的标题建议：
        
        房源信息：
        - 当前标题: {listing_details.get('title')}
        - 类型: {listing_details.get('locationType')}
        - 房间数: {listing_details.get('numOfBeds')} 间
        - 价格: ${listing_details.get('price')} 每晚
        - 位置特点: {self._get_location_features(listing_details)}
        - 设施亮点: {self._get_amenity_highlights(listing_details)}
        
        成功房源的标题特征：
        {successful_patterns}
        
        请生成 {num_suggestions} 个不同风格的标题建议，每个建议都应该：
        1. 突出房源的独特卖点
        2. 使用吸引人的关键词
        3. 长度适中（建议 50-60 个字符）
        4. 包含重要的搜索关键词
        5. 风格不同（正式、休闲、奢华等）
        
        对于每个建议，请解释为什么它会吸引目标客户。
        """
        
        try:
            suggestions = await self._call_llm_service(prompt)
            
            # 分析每个建议的效果
            analyzed_suggestions = []
            for suggestion in suggestions.split("\n\n")[:num_suggestions]:
                if not suggestion.strip():
                    continue
                    
                # 分析建议标题的关键词
                keywords = await self._analyze_keywords(suggestion, listing_details)
                
                analyzed_suggestions.append({
                    "title": suggestion.split(":")[0] if ":" in suggestion else suggestion,
                    "explanation": suggestion.split(":", 1)[1].strip() if ":" in suggestion else "",
                    "keywords": keywords,
                    "metrics": {
                        "length": len(suggestion),
                        "word_count": len(suggestion.split()),
                        "has_numbers": any(c.isdigit() for c in suggestion),
                        "has_special_chars": any(not c.isalnum() and not c.isspace() for c in suggestion)
                    }
                })
            
            return {
                "status": "success",
                "listing_id": listing_id,
                "current_title": listing_details.get("title"),
                "suggestions": analyzed_suggestions
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"生成标题建议时出错: {str(e)}"
            }
    
    async def get_title_improvement_tips(self, listing_id: str) -> Dict[str, Any]:
        """
        获取改进标题的具体建议
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            标题改进建议
        """
        # 获取房源详细信息
        listing_details = await self._get_listing_details(listing_id)
        
        if not listing_details:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        # 分析当前标题
        current_analysis = await self.analyze_current_title(listing_id)
        
        if current_analysis["status"] == "error":
            return current_analysis
        
        # 准备 LLM 提示
        prompt = f"""
        作为短期租赁标题优化专家，请提供具体的标题改进建议：
        
        当前标题：{listing_details.get('title')}
        
        分析结果：
        {current_analysis.get('analysis', '无分析结果')}
        
        请提供：
        1. 如何突出房源的独特卖点
        2. 如何使用更吸引人的关键词
        3. 如何优化标题长度和结构
        4. 如何提高搜索可见度
        5. 如何针对目标客户群优化标题
        6. 应该避免的常见错误
        
        请提供具体、可操作的建议，并解释每个建议的原因。
        """
        
        try:
            improvement_tips = await self._call_llm_service(prompt)
            
            # 获取高效关键词建议
            effective_keywords = await self._get_effective_keywords(listing_details.get("locationType"))
            
            return {
                "status": "success",
                "listing_id": listing_id,
                "current_title": listing_details.get("title"),
                "improvement_tips": improvement_tips,
                "effective_keywords": effective_keywords,
                "current_analysis": current_analysis
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"获取标题改进建议时出错: {str(e)}"
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
    
    async def _analyze_keywords(self, title: str, listing_details: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        分析标题中使用的关键词
        
        Args:
            title: 要分析的标题
            listing_details: 房源详细信息
            
        Returns:
            关键词分析结果
        """
        # 获取该类型房源的有效关键词
        effective_keywords = await self._get_effective_keywords(listing_details.get("locationType"))
        
        # 分析标题中的关键词使用
        words = title.lower().split()
        used_keywords = []
        
        for word in words:
            # 检查是否是有效关键词
            is_effective = any(k["keyword"].lower() == word for k in effective_keywords)
            
            # 获取关键词效果评分（如果是有效关键词）
            effectiveness = next(
                (k["effectiveness"] for k in effective_keywords if k["keyword"].lower() == word),
                0
            )
            
            used_keywords.append({
                "keyword": word,
                "is_effective": is_effective,
                "effectiveness": effectiveness
            })
        
        return used_keywords
    
    async def _get_effective_keywords(self, location_type: str) -> List[Dict[str, Any]]:
        """
        获取特定类型房源的有效关键词
        
        Args:
            location_type: 房源类型
            
        Returns:
            有效关键词列表
        """
        # 在实际应用中，这些数据应该来自分析或数据库
        # 这里使用示例数据
        keywords_by_type = {
            "APARTMENT": [
                {"keyword": "现代", "effectiveness": 0.8},
                {"keyword": "市中心", "effectiveness": 0.9},
                {"keyword": "便利", "effectiveness": 0.7},
                {"keyword": "豪华", "effectiveness": 0.8},
                {"keyword": "景观", "effectiveness": 0.7}
            ],
            "HOUSE": [
                {"keyword": "独栋", "effectiveness": 0.9},
                {"keyword": "花园", "effectiveness": 0.8},
                {"keyword": "私密", "effectiveness": 0.8},
                {"keyword": "宽敞", "effectiveness": 0.7},
                {"keyword": "家庭", "effectiveness": 0.8}
            ],
            "BEACH": [
                {"keyword": "海景", "effectiveness": 0.9},
                {"keyword": "沙滩", "effectiveness": 0.9},
                {"keyword": "度假", "effectiveness": 0.8},
                {"keyword": "日落", "effectiveness": 0.7},
                {"keyword": "海边", "effectiveness": 0.8}
            ],
            "MOUNTAIN": [
                {"keyword": "山景", "effectiveness": 0.9},
                {"keyword": "度假", "effectiveness": 0.8},
                {"keyword": "自然", "effectiveness": 0.8},
                {"keyword": "清新", "effectiveness": 0.7},
                {"keyword": "宁静", "effectiveness": 0.8}
            ],
            "COUNTRYSIDE": [
                {"keyword": "田园", "effectiveness": 0.8},
                {"keyword": "自然", "effectiveness": 0.8},
                {"keyword": "宁静", "effectiveness": 0.9},
                {"keyword": "度假", "effectiveness": 0.7},
                {"keyword": "风景", "effectiveness": 0.8},
                {"keyword": "乡村", "effectiveness": 0.8}
            ]
        }
        
        return keywords_by_type.get(location_type, keywords_by_type["APARTMENT"])
    
    async def _get_successful_title_patterns(self, location_type: str) -> str:
        """
        获取成功房源的标题模式
        
        Args:
            location_type: 房源类型
            
        Returns:
            成功标题模式的描述
        """
        # 在实际应用中，这些数据应该来自分析或数据库
        # 这里使用示例数据
        patterns_by_type = {
            "APARTMENT": """
            1. 使用"现代"、"豪华"、"市中心"等关键词
            2. 提及便利设施和交通便利性
            3. 强调空间感和视野
            4. 包含附近的热门景点或商业区
            5. 使用数字（如房间数量、面积）增加具体性
            """,
            "HOUSE": """
            1. 强调"独栋"、"私密"、"宽敞"等特点
            2. 提及户外空间（如花园、庭院）
            3. 强调适合家庭或团体
            4. 描述房屋的建筑风格或特色
            5. 提及周边环境的宁静或便利
            """,
            "BEACH": """
            1. 强调"海景"、"沙滩"、"日落"等关键词
            2. 提及到海滩的距离（如"步行5分钟"）
            3. 使用"度假"、"放松"等休闲相关词汇
            4. 描述海景视野的特点
            5. 提及水上活动或海滩设施
            """,
            "MOUNTAIN": """
            1. 使用"山景"、"自然"、"宁静"等关键词
            2. 提及户外活动（如徒步、滑雪）
            3. 描述自然环境和风景
            4. 强调远离喧嚣的宁静体验
            5. 提及季节性特色（如"滑雪天堂"、"秋叶观赏"）
            """,
            "COUNTRYSIDE": """
            1. 使用"田园"、"乡村"、"宁静"等关键词
            2. 强调自然环境和宁静氛围
            3. 提及周边的自然景观
            4. 描述乡村特色或农场元素
            5. 强调远离城市的放松体验
            """
        }
        
        return patterns_by_type.get(location_type, patterns_by_type["APARTMENT"])
    
    def _get_location_features(self, listing_details: Dict[str, Any]) -> str:
        """
        获取房源位置特点的描述
        
        Args:
            listing_details: 房源详细信息
            
        Returns:
            位置特点描述
        """
        # 在实际应用中，这应该基于地理编码或位置数据
        # 这里使用简化的实现
        location_type = listing_details.get("locationType", "APARTMENT")
        
        location_features = {
            "APARTMENT": "市区位置，交通便利",
            "HOUSE": "安静的住宅区",
            "BEACH": "靠近海滩，海景视野",
            "MOUNTAIN": "山区位置，自然环境优美",
            "COUNTRYSIDE": "乡村环境，远离城市喧嚣"
        }
        
        return location_features.get(location_type, "位置良好")
    
    def _get_amenity_highlights(self, listing_details: Dict[str, Any]) -> str:
        """
        获取房源设施亮点的描述
        
        Args:
            listing_details: 房源详细信息
            
        Returns:
            设施亮点描述
        """
        amenities = listing_details.get("amenities", [])
        
        if not amenities:
            return "标准设施齐全"
        
        # 提取设施名称
        amenity_names = [a.get("name", "") for a in amenities if a.get("name")]
        
        # 选择最多3个亮点设施
        highlights = amenity_names[:3]
        
        if highlights:
            return "、".join(highlights)
        else:
            return "标准设施齐全"
    
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