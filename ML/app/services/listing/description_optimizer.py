import os
from typing import Dict, Any, List, Optional
import requests
import json

class DescriptionOptimizer:
    """
    描述优化服务，帮助房东改进房源描述
    
    功能：
    1. 分析当前描述的优缺点
    2. 生成优化建议
    3. 提供结构化描述模板
    4. 突出房源的独特卖点
    5. 针对不同目标客户群优化描述
    """
    
    def __init__(self, api_url: Optional[str] = None, llm_service_url: Optional[str] = None):
        """
        初始化描述优化服务
        
        Args:
            api_url: GraphQL API 的 URL，如果为 None，则使用环境变量或默认值
            llm_service_url: LLM 服务的 URL，如果为 None，则使用环境变量或默认值
        """
        self.api_url = api_url or os.getenv("SUBGRAPH_LISTINGS_API_URL", "http://localhost:4000/graphql")
        self.llm_service_url = llm_service_url or os.getenv("LLM_SERVICE_URL", "http://localhost:5000/api/llm")
    
    async def analyze_current_description(self, listing_id: str) -> Dict[str, Any]:
        """
        分析当前房源描述的优缺点
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            描述分析结果
        """
        # 获取房源详细信息
        listing_details = await self._get_listing_details(listing_id)
        
        if not listing_details:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        current_description = listing_details.get("description", "")
        
        if not current_description:
            return {
                "status": "error",
                "message": "房源没有描述"
            }
        
        # 准备 LLM 提示
        prompt = f"""
        作为短期租赁描述优化专家，请分析以下房源描述的优缺点：
        
        房源描述：
        {current_description}
        
        房源信息：
        - 标题: {listing_details.get('title')}
        - 类型: {listing_details.get('locationType')}
        - 房间数: {listing_details.get('numOfBeds')} 间
        - 价格: ${listing_details.get('price')} 每晚
        - 设施: {self._get_amenity_list(listing_details)}
        
        请提供：
        1. 描述的优点（吸引人的元素）
        2. 描述的缺点（需要改进的地方）
        3. 内容完整性分析（是否涵盖了所有重要信息）
        4. 语言和风格分析（是否吸引人、易于阅读）
        5. 结构分析（是否组织良好、重点突出）
        6. SEO 和关键词使用分析
        
        请以房东的角度提供具体、实用的分析。
        """
        
        try:
            analysis = await self._call_llm_service(prompt)
            
            # 计算描述的基本指标
            metrics = self._calculate_description_metrics(current_description)
            
            # 检查描述中是否包含关键信息
            key_info_coverage = self._check_key_info_coverage(current_description, listing_details)
            
            return {
                "status": "success",
                "listing_id": listing_id,
                "current_description": current_description,
                "analysis": analysis,
                "metrics": metrics,
                "key_info_coverage": key_info_coverage
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"分析描述时出错: {str(e)}"
            }
    
    async def generate_improved_description(self, listing_id: str) -> Dict[str, Any]:
        """
        生成改进的房源描述
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            改进的描述建议
        """
        # 获取房源详细信息
        listing_details = await self._get_listing_details(listing_id)
        
        if not listing_details:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        current_description = listing_details.get("description", "")
        
        # 获取成功房源的描述特征
        successful_patterns = await self._get_successful_description_patterns(listing_details.get("locationType"))
        
        # 准备 LLM 提示
        prompt = f"""
        作为短期租赁描述优化专家，请为以下房源生成一个优化的描述：
        
        当前描述：
        {current_description}
        
        房源信息：
        - 标题: {listing_details.get('title')}
        - 类型: {listing_details.get('locationType')}
        - 房间数: {listing_details.get('numOfBeds')} 间
        - 价格: ${listing_details.get('price')} 每晚
        - 设施: {self._get_amenity_list(listing_details)}
        
        成功房源的描述特征：
        {successful_patterns}
        
        请生成一个优化的描述，应该：
        1. 保留原描述中的准确信息
        2. 改进结构，使用段落和小标题
        3. 突出房源的独特卖点
        4. 使用吸引人的语言和形容词
        5. 包含所有必要的信息（房间、设施、位置、规则等）
        6. 针对目标客户群优化内容
        7. 长度适中（建议 300-500 字）
        
        请提供一个完整的、结构良好的描述。
        """
        
        try:
            improved_description = await self._call_llm_service(prompt)
            
            # 计算改进描述的基本指标
            improved_metrics = self._calculate_description_metrics(improved_description)
            
            # 检查改进描述中是否包含关键信息
            improved_key_info_coverage = self._check_key_info_coverage(improved_description, listing_details)
            
            # 比较原描述和改进描述
            comparison = {
                "original_length": len(current_description),
                "improved_length": len(improved_description),
                "length_difference": len(improved_description) - len(current_description),
                "original_metrics": self._calculate_description_metrics(current_description),
                "improved_metrics": improved_metrics
            }
            
            return {
                "status": "success",
                "listing_id": listing_id,
                "current_description": current_description,
                "improved_description": improved_description,
                "comparison": comparison,
                "key_info_coverage": improved_key_info_coverage
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"生成改进描述时出错: {str(e)}"
            }
    
    async def get_description_templates(self, listing_id: str) -> Dict[str, Any]:
        """
        获取适合房源的描述模板
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            描述模板列表
        """
        # 获取房源详细信息
        listing_details = await self._get_listing_details(listing_id)
        
        if not listing_details:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        # 根据房源类型获取适合的模板
        location_type = listing_details.get("locationType", "APARTMENT")
        
        # 准备 LLM 提示
        prompt = f"""
        作为短期租赁描述专家，请为以下类型的房源提供 3 个不同风格的描述模板：
        
        房源信息：
        - 类型: {location_type}
        - 房间数: {listing_details.get('numOfBeds')} 间
        - 价格: ${listing_details.get('price')} 每晚
        
        请提供以下风格的模板：
        1. 简洁专业风格（适合商务旅客）
        2. 温馨详细风格（适合家庭旅客）
        3. 活力体验风格（适合年轻旅客）
        
        每个模板应包含：
        - 开场白
        - 房间和空间描述部分
        - 设施描述部分
        - 位置和周边描述部分
        - 适合客户群描述
        - 结束语
        
        请使用 [房间数]、[特色设施]、[位置特点] 等占位符，以便房东可以填入自己的具体信息。
        """
        
        try:
            templates = await self._call_llm_service(prompt)
            
            # 为每个模板添加使用说明
            usage_instructions = """
            使用说明：
            1. 选择最适合您目标客户群的模板
            2. 替换 [占位符] 为您房源的具体信息
            3. 根据需要调整段落和内容
            4. 确保所有重要信息都已包含
            5. 检查拼写和语法
            """
            
            return {
                "status": "success",
                "listing_id": listing_id,
                "templates": templates,
                "usage_instructions": usage_instructions
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"获取描述模板时出错: {str(e)}"
            }
    
    async def get_description_improvement_tips(self, listing_id: str) -> Dict[str, Any]:
        """
        获取改进描述的具体建议
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            描述改进建议
        """
        # 获取房源详细信息
        listing_details = await self._get_listing_details(listing_id)
        
        if not listing_details:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        # 分析当前描述
        current_analysis = await self.analyze_current_description(listing_id)
        
        if current_analysis["status"] == "error":
            return current_analysis
        
        # 准备 LLM 提示
        prompt = f"""
        作为短期租赁描述优化专家，请提供具体的描述改进建议：
        
        当前描述：
        {listing_details.get('description')}
        
        分析结果：
        {current_analysis.get('analysis', '无分析结果')}
        
        请提供：
        1. 如何改进描述的结构和组织
        2. 如何更好地突出房源的独特卖点
        3. 如何使用更吸引人的语言和形容词
        4. 如何针对目标客户群优化内容
        5. 如何确保包含所有必要信息
        6. 如何提高描述的可读性和吸引力
        
        请提供具体、可操作的建议，并解释每个建议的原因。
        """
        
        try:
            improvement_tips = await self._call_llm_service(prompt)
            
            # 获取高效关键词建议
            effective_keywords = await self._get_effective_description_keywords(listing_details.get("locationType"))
            
            return {
                "status": "success",
                "listing_id": listing_id,
                "current_description": listing_details.get("description"),
                "improvement_tips": improvement_tips,
                "effective_keywords": effective_keywords,
                "current_analysis": current_analysis
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"获取描述改进建议时出错: {str(e)}"
            }
    
    def _calculate_description_metrics(self, description: str) -> Dict[str, Any]:
        """
        计算描述的基本指标
        
        Args:
            description: 房源描述
            
        Returns:
            描述指标
        """
        words = description.split()
        sentences = description.replace("!", ".").replace("?", ".").split(".")
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # 计算平均句子长度
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        
        # 计算段落数
        paragraphs = description.split("\n\n")
        paragraphs = [p.strip() for p in paragraphs if p.strip()]
        
        return {
            "length": len(description),
            "word_count": len(words),
            "sentence_count": len(sentences),
            "paragraph_count": len(paragraphs),
            "avg_sentence_length": round(avg_sentence_length, 1),
            "avg_paragraph_length": round(len(words) / len(paragraphs), 1) if paragraphs else 0
        }
    
    def _check_key_info_coverage(self, description: str, listing_details: Dict[str, Any]) -> Dict[str, bool]:
        """
        检查描述中是否包含关键信息
        
        Args:
            description: 房源描述
            listing_details: 房源详细信息
            
        Returns:
            关键信息覆盖情况
        """
        description_lower = description.lower()
        
        # 检查是否包含关键信息类别
        coverage = {
            "mentions_rooms": any(word in description_lower for word in ["bedroom", "room", "bed", "卧室", "房间", "床"]),
            "mentions_bathrooms": any(word in description_lower for word in ["bathroom", "bath", "shower", "浴室", "卫生间", "淋浴"]),
            "mentions_amenities": any(amenity["name"].lower() in description_lower for amenity in listing_details.get("amenities", [])),
            "mentions_location": any(word in description_lower for word in ["location", "near", "close", "位置", "附近", "周边"]),
            "mentions_transportation": any(word in description_lower for word in ["transport", "subway", "bus", "train", "交通", "地铁", "公交", "火车"]),
            "mentions_rules": any(word in description_lower for word in ["rule", "policy", "check", "规则", "政策", "入住", "退房"]),
            "mentions_price": any(word in description_lower for word in ["price", "cost", "fee", "价格", "费用", "收费"])
        }
        
        return coverage
    
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
    
    def _get_amenity_list(self, listing_details: Dict[str, Any]) -> str:
        """
        获取房源设施列表的描述
        
        Args:
            listing_details: 房源详细信息
            
        Returns:
            设施列表描述
        """
        amenities = listing_details.get("amenities", [])
        
        if not amenities:
            return "标准设施齐全"
        
        # 提取设施名称
        amenity_names = [a.get("name", "") for a in amenities if a.get("name")]
        
        if amenity_names:
            return "、".join(amenity_names)
        else:
            return "标准设施齐全"
    
    async def _get_successful_description_patterns(self, location_type: str) -> str:
        """
        获取成功房源的描述模式
        
        Args:
            location_type: 房源类型
            
        Returns:
            成功描述模式的描述
        """
        # 在实际应用中，这些数据应该来自分析或数据库
        # 这里使用示例数据
        patterns_by_type = {
            "APARTMENT": """
            1. 以简洁的开场白介绍房源的主要特点
            2. 详细描述每个房间的布局和设施
            3. 强调位置的便利性和周边设施
            4. 突出适合的客户群（如商务、情侣、家庭等）
            5. 列出所有重要设施和便利设施
            6. 清晰说明入住和退房规则
            """,
            "HOUSE": """
            1. 强调房屋的私密性和独立性
            2. 详细描述室内外空间
            3. 突出花园、庭院等户外特色
            4. 描述适合的活动（如烧烤、聚会等）
            5. 强调适合家庭或团体入住
            6. 说明停车和安保情况
            """,
            "BEACH": """
            1. 突出海景和到海滩的距离
            2. 描述日落/日出景观
            3. 列出海滩活动和设施
            4. 强调度假氛围和放松体验
            5. 描述阳台/露台的海景
            6. 提供周边餐厅和娱乐信息
            """,
            "MOUNTAIN": """
            1. 描述山景和自然环境
            2. 强调清新空气和宁静氛围
            3. 列出户外活动机会
            4. 突出适合放松和度假
            5. 描述观景位置和视野
            6. 提供周边徒步路线信息
            """,
            "COUNTRYSIDE": """
            1. 强调远离城市的宁静环境
            2. 描述自然风光和田园风景
            3. 突出独特的乡村体验
            4. 列出可能的户外活动
            5. 描述适合放松和度假
            6. 提供周边景点和活动信息
            """
        }
        
        return patterns_by_type.get(location_type, patterns_by_type["APARTMENT"])
    
    async def _get_effective_description_keywords(self, location_type: str) -> List[Dict[str, Any]]:
        """
        获取特定类型房源的有效描述关键词
        
        Args:
            location_type: 房源类型
            
        Returns:
            有效关键词列表
        """
        # 在实际应用中，这些数据应该来自分析或数据库
        # 这里使用示例数据
        keywords_by_type = {
            "APARTMENT": [
                {"keyword": "现代化", "category": "风格", "effectiveness": 0.8},
                {"keyword": "便利", "category": "位置", "effectiveness": 0.9},
                {"keyword": "舒适", "category": "体验", "effectiveness": 0.8},
                {"keyword": "时尚", "category": "风格", "effectiveness": 0.7},
                {"keyword": "宽敞", "category": "空间", "effectiveness": 0.8}
            ],
            "HOUSE": [
                {"keyword": "独立", "category": "特点", "effectiveness": 0.9},
                {"keyword": "私密", "category": "特点", "effectiveness": 0.8},
                {"keyword": "花园", "category": "设施", "effectiveness": 0.8},
                {"keyword": "家庭", "category": "目标群", "effectiveness": 0.9},
                {"keyword": "温馨", "category": "氛围", "effectiveness": 0.8}
            ],
            "BEACH": [
                {"keyword": "海景", "category": "视野", "effectiveness": 0.9},
                {"keyword": "沙滩", "category": "位置", "effectiveness": 0.9},
                {"keyword": "日落", "category": "体验", "effectiveness": 0.8},
                {"keyword": "度假", "category": "目的", "effectiveness": 0.8},
                {"keyword": "放松", "category": "体验", "effectiveness": 0.8}
            ],
            "MOUNTAIN": [
                {"keyword": "山景", "category": "视野", "effectiveness": 0.9},
                {"keyword": "自然", "category": "环境", "effectiveness": 0.8},
                {"keyword": "清新", "category": "空气", "effectiveness": 0.8},
                {"keyword": "宁静", "category": "氛围", "effectiveness": 0.9},
                {"keyword": "度假", "category": "目的", "effectiveness": 0.8}
            ],
            "COUNTRYSIDE": [
                {"keyword": "田园", "category": "环境", "effectiveness": 0.8},
                {"keyword": "宁静", "category": "氛围", "effectiveness": 0.9},
                {"keyword": "自然", "category": "环境", "effectiveness": 0.8},
                {"keyword": "放松", "category": "体验", "effectiveness": 0.8},
                {"keyword": "乡村", "category": "风格", "effectiveness": 0.8}
            ]
        }
        
        return keywords_by_type.get(location_type, keywords_by_type["APARTMENT"])
    
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