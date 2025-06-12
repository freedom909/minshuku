import os
from typing import Dict, Any, List, Optional
import requests
import json

class ImageAdvisor:
    """
    图片建议服务，帮助房东改进他们的房源图片
    
    功能：
    1. 分析现有房源图片
    2. 提供图片质量和吸引力评估
    3. 给出改进建议
    4. 推荐最佳的图片顺序
    5. 建议需要添加的场景照片
    """
    
    def __init__(self, api_url: Optional[str] = None, llm_service_url: Optional[str] = None):
        """
        初始化图片建议服务
        
        Args:
            api_url: GraphQL API 的 URL，如果为 None，则使用环境变量或默认值
            llm_service_url: LLM 服务的 URL，如果为 None，则使用环境变量或默认值
        """
        self.api_url = api_url or os.getenv("SUBGRAPH_LISTINGS_API_URL", "http://localhost:4000/graphql")
        self.llm_service_url = llm_service_url or os.getenv("LLM_SERVICE_URL", "http://localhost:5000/api/llm")
        self.vision_service_url = os.getenv("VISION_SERVICE_URL", "http://localhost:5000/api/vision")
    
    async def analyze_listing_images(self, listing_id: str) -> Dict[str, Any]:
        """
        分析房源的现有图片
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            图片分析结果
        """
        # 获取房源详细信息，包括图片 URL
        listing_details = await self._get_listing_details(listing_id)
        
        if not listing_details:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        pictures = listing_details.get("pictures", [])
        
        if not pictures:
            return {
                "status": "error",
                "message": "该房源没有图片"
            }
        
        # 分析每张图片
        image_analysis = []
        for i, image_url in enumerate(pictures):
            try:
                # 调用视觉 AI 服务分析图片
                analysis = await self._analyze_image(image_url)
                
                image_analysis.append({
                    "index": i,
                    "url": image_url,
                    "analysis": analysis
                })
            except Exception as e:
                image_analysis.append({
                    "index": i,
                    "url": image_url,
                    "error": str(e)
                })
        
        # 计算整体图片质量评分
        valid_analyses = [img for img in image_analysis if "analysis" in img]
        if valid_analyses:
            avg_quality = sum(img["analysis"].get("quality_score", 0) for img in valid_analyses) / len(valid_analyses)
            avg_appeal = sum(img["analysis"].get("appeal_score", 0) for img in valid_analyses) / len(valid_analyses)
        else:
            avg_quality = 0
            avg_appeal = 0
        
        # 检查是否缺少关键场景的图片
        essential_scenes = ["外观", "客厅", "厨房", "卧室", "浴室"]
        detected_scenes = set()
        for img in image_analysis:
            if "analysis" in img and "detected_scenes" in img["analysis"]:
                detected_scenes.update(img["analysis"].get("detected_scenes", []))
        
        missing_scenes = [scene for scene in essential_scenes if scene not in detected_scenes]
        
        return {
            "status": "success",
            "listing_id": listing_id,
            "total_images": len(pictures),
            "image_analysis": image_analysis,
            "overall_quality": {
                "quality_score": round(avg_quality, 2),
                "appeal_score": round(avg_appeal, 2)
            },
            "missing_essential_scenes": missing_scenes
        }
    
    async def get_image_improvement_suggestions(self, listing_id: str) -> Dict[str, Any]:
        """
        获取图片改进建议
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            图片改进建议
        """
        # 首先分析现有图片
        analysis_result = await self.analyze_listing_images(listing_id)
        
        if analysis_result["status"] == "error":
            return analysis_result
        
        # 获取房源详细信息
        listing_details = await self._get_listing_details(listing_id)
        
        # 准备 LLM 提示
        prompt = f"""
        作为短期租赁摄影专家，请根据以下分析为房东提供改进房源图片的具体建议：
        
        房源信息：
        - 标题: {listing_details.get('title')}
        - 类型: {listing_details.get('locationType')}
        - 房间数: {listing_details.get('numOfBeds')} 间
        
        图片分析：
        - 总图片数量: {analysis_result['total_images']}
        - 整体质量评分: {analysis_result['overall_quality']['quality_score']}/10
        - 整体吸引力评分: {analysis_result['overall_quality']['appeal_score']}/10
        - 缺少的关键场景: {', '.join(analysis_result['missing_essential_scenes']) if analysis_result['missing_essential_scenes'] else '无'}
        
        请提供：
        1. 总体图片质量评估
        2. 最需要改进的方面（如光线、构图、清晰度等）
        3. 针对缺少的关键场景的具体建议
        4. 如何拍摄更吸引人的房源照片的技巧
        5. 推荐的图片顺序安排
        6. 其他可以提高图片吸引力的建议
        
        请以房东的角度提供实用、具体的建议，避免使用过于技术性的语言。
        """
        
        try:
            llm_response = await self._call_llm_service(prompt)
            
            # 为每张图片生成具体建议
            image_specific_suggestions = []
            for img in analysis_result["image_analysis"]:
                if "analysis" not in img:
                    continue
                
                img_prompt = f"""
                请针对这张房源图片提供具体的改进建议：
                
                图片信息：
                - 场景: {', '.join(img['analysis'].get('detected_scenes', ['未检测到']))}
                - 质量评分: {img['analysis'].get('quality_score', 'N/A')}/10
                - 吸引力评分: {img['analysis'].get('appeal_score', 'N/A')}/10
                - 检测到的问题: {', '.join(img['analysis'].get('detected_issues', ['无']))}
                
                请提供 3-5 条具体的改进建议，重点关注如何提高这张图片的吸引力和质量。
                """
                
                try:
                    img_suggestion = await self._call_llm_service(img_prompt)
                    image_specific_suggestions.append({
                        "image_index": img["index"],
                        "image_url": img["url"],
                        "suggestions": img_suggestion
                    })
                except Exception:
                    # 如果单张图片的建议生成失败，继续处理其他图片
                    pass
            
            # 推荐最佳图片顺序
            recommended_order = self._recommend_image_order(analysis_result["image_analysis"])
            
            return {
                "status": "success",
                "listing_id": listing_id,
                "overall_suggestions": llm_response,
                "image_specific_suggestions": image_specific_suggestions,
                "recommended_image_order": recommended_order,
                "missing_scenes": analysis_result["missing_essential_scenes"]
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"获取图片改进建议时出错: {str(e)}",
                "analysis_result": analysis_result
            }
    
    async def get_photography_tips(self, listing_id: str) -> Dict[str, Any]:
        """
        获取针对特定房源类型的摄影技巧
        
        Args:
            listing_id: 房源的 ID
            
        Returns:
            摄影技巧和建议
        """
        # 获取房源详细信息
        listing_details = await self._get_listing_details(listing_id)
        
        if not listing_details:
            return {
                "status": "error",
                "message": f"无法获取房源 ID {listing_id} 的详细信息"
            }
        
        location_type = listing_details.get("locationType", "APARTMENT")
        num_of_beds = listing_details.get("numOfBeds", 1)
        
        # 根据房源类型准备不同的摄影技巧
        location_specific_tips = {
            "APARTMENT": [
                "使用广角镜头展示空间的开阔感",
                "拍摄窗外的景色，展示自然光和视野",
                "展示公共设施，如健身房、泳池等",
                "拍摄阳台或露台的照片，展示户外空间"
            ],
            "HOUSE": [
                "从路边拍摄房屋外观，展示整体外观",
                "展示院子、花园或户外娱乐区",
                "拍摄多个角度的客厅，展示空间的流动性",
                "如有特色建筑元素，确保突出展示"
            ],
            "BEACH": [
                "拍摄海景视野，最好在黄金时段（日出或日落）",
                "展示通往海滩的路径或距离",
                "拍摄户外休息区，如阳台或露台上的海景",
                "展示与海滩相关的设施，如沙滩椅、遮阳伞等"
            ],
            "MOUNTAIN": [
                "拍摄山景视野，最好在光线良好的时候",
                "展示户外活动区域，如露台或庭院",
                "如有壁炉，确保拍摄点燃的壁炉照片",
                "展示周围的自然环境和徒步路径"
            ],
            "COUNTRYSIDE": [
                "展示周围的自然风光和开阔视野",
                "拍摄日出或日落时的风景照片",
                "展示户外休息区和用餐区",
                "如有农场元素，如动物或花园，确保包含"
            ]
        }
        
        # 准备 LLM 提示
        prompt = f"""
        作为短期租赁摄影专家，请为以下类型的房源提供详细的摄影技巧和建议：
        
        房源信息：
        - 标题: {listing_details.get('title')}
        - 类型: {location_type}
        - 房间数: {num_of_beds} 间
        
        针对这种类型的房源，以下是一些基本技巧：
        {', '.join(location_specific_tips.get(location_type, location_specific_tips["APARTMENT"]))}
        
        请提供：
        1. 详细的摄影技巧，包括最佳拍摄时间、光线使用、角度选择等
        2. 应该拍摄的必要场景清单（按优先级排序）
        3. 如何突出这类房源的独特卖点
        4. 常见的摄影错误和如何避免
        5. 简单的后期处理建议，提升照片质量
        6. 使用智能手机拍摄的技巧（不需要专业设备）
        
        请以房东的角度提供实用、具体的建议，避免使用过于技术性的语言。
        """
        
        try:
            llm_response = await self._call_llm_service(prompt)
            
            # 推荐的场景清单
            recommended_scenes = self._get_recommended_scenes(location_type, num_of_beds)
            
            return {
                "status": "success",
                "listing_id": listing_id,
                "location_type": location_type,
                "photography_tips": llm_response,
                "recommended_scenes": recommended_scenes
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"获取摄影技巧时出错: {str(e)}"
            }
    
    def _recommend_image_order(self, image_analysis: List[Dict[str, Any]]) -> List[int]:
        """
        推荐最佳的图片顺序
        
        Args:
            image_analysis: 图片分析结果列表
            
        Returns:
            推荐的图片索引顺序
        """
        # 这是一个简化的实现，实际应用中应该基于更复杂的算法
        # 例如考虑图片质量、场景类型、吸引力等因素
        
        # 首先按场景类型分组
        scene_groups = {
            "外观": [],
            "客厅": [],
            "厨房": [],
            "卧室": [],
            "浴室": [],
            "其他": []
        }
        
        for img in image_analysis:
            if "analysis" not in img:
                continue
                
            detected_scenes = img["analysis"].get("detected_scenes", [])
            
            # 将图片分配到相应的场景组
            assigned = False
            for scene in detected_scenes:
                for key in scene_groups.keys():
                    if key in scene:
                        scene_groups[key].append(img)
                        assigned = True
                        break
                if assigned:
                    break
            
            # 如果没有匹配的场景，归为"其他"
            if not assigned:
                scene_groups["其他"].append(img)
        
        # 在每个场景组内，按质量和吸引力评分排序
        for scene, images in scene_groups.items():
            scene_groups[scene] = sorted(
                images,
                key=lambda img: (
                    img.get("analysis", {}).get("quality_score", 0) +
                    img.get("analysis", {}).get("appeal_score", 0)
                ),
                reverse=True
            )
        
        # 定义场景的理想顺序
        scene_order = ["外观", "客厅", "厨房", "卧室", "浴室", "其他"]
        
        # 按理想顺序组合图片
        recommended_order = []
        for scene in scene_order:
            for img in scene_groups[scene]:
                recommended_order.append(img["index"])
        
        return recommended_order
    
    def _get_recommended_scenes(self, location_type: str, num_of_beds: int) -> List[Dict[str, str]]:
        """
        获取推荐的场景清单
        
        Args:
            location_type: 房源类型
            num_of_beds: 房间数量
            
        Returns:
            推荐的场景清单
        """
        # 基本场景，适用于所有房源类型
        basic_scenes = [
            {"scene": "外观", "description": "房源的外观，展示整体风格和环境"},
            {"scene": "客厅", "description": "展示客厅的空间、家具和自然光"},
            {"scene": "厨房", "description": "展示厨房设施、台面和用餐区"},
            {"scene": "主卧室", "description": "展示主卧室的床、家具和空间"}
        ]
        
        # 根据房间数量添加额外的卧室场景
        if num_of_beds > 1:
            for i in range(2, min(num_of_beds + 1, 5)):  # 最多展示4个卧室
                basic_scenes.append({
                    "scene": f"卧室 {i}",
                    "description": f"展示卧室 {i} 的床、家具和空间"
                })
        
        # 添加浴室场景
        basic_scenes.append({
            "scene": "浴室",
            "description": "展示浴室的设施、洁具和空间"
        })
        
        # 根据房源类型添加特定场景
        location_specific_scenes = {
            "APARTMENT": [
                {"scene": "阳台/露台", "description": "如有阳台或露台，展示户外空间和视野"},
                {"scene": "公共设施", "description": "展示公寓楼的公共设施，如健身房、泳池等"}
            ],
            "HOUSE": [
                {"scene": "院子/花园", "description": "展示户外空间、花园或庭院"},
                {"scene": "户外休息区", "description": "展示户外用餐区或休息区"}
            ],
            "BEACH": [
                {"scene": "海景视野", "description": "展示从房源看到的海景，最好在日出或日落时拍摄"},
                {"scene": "通往海滩的路径", "description": "展示从房源到海滩的距离和路径"}
            ],
            "MOUNTAIN": [
                {"scene": "山景视野", "description": "展示从房源看到的山景"},
                {"scene": "户外活动区", "description": "展示适合户外活动的区域"}
            ],
            "COUNTRYSIDE": [
                {"scene": "自然风光", "description": "展示周围的自然环境和风景"},
                {"scene": "户外空间", "description": "展示适合放松和享受自然的户外空间"}
            ]
        }
        
        # 合并基本场景和特定场景
        recommended_scenes = basic_scenes + location_specific_scenes.get(location_type, [])
        
        return recommended_scenes
    
    async def _analyze_image(self, image_url: str) -> Dict[str, Any]:
        """
        分析图片质量和内容
        
        Args:
            image_url: 图片 URL
            
        Returns:
            图片分析结果
        """
        try:
            # 调用视觉 AI 服务
            response = requests.post(
                self.vision_service_url,
                json={"image_url": image_url},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            result = response.json()
            
            if "error" in result:
                raise Exception(f"Vision API Error: {result['error']}")
            
            # 在实际应用中，这里应该调用真实的视觉 AI 服务
            # 以下是模拟的分析结果
            
            # 模拟检测场景
            scenes = ["客厅", "厨房", "卧室", "浴室", "外观", "阳台"]
            detected_scene = scenes[hash(image_url) % len(scenes)]
            
            # 模拟质量评分 (1-10)
            quality_score = (hash(image_url) % 5) + 5  # 5-9 范围内
            
            # 模拟吸引力评分 (1-10)
            appeal_score = (hash(image_url) % 6) + 4  # 4-9 范围内
            
            # 模拟检测到的问题
            issues = ["光线不足", "构图不佳", "模糊", "过度曝光", "角度不佳", "无问题"]
            detected_issue = issues[hash(image_url) % len(issues)]
            detected_issues = [] if detected_issue == "无问题" else [detected_issue]
            
            return {
                "detected_scenes": [detected_scene],
                "quality_score": quality_score,
                "appeal_score": appeal_score,
                "detected_issues": detected_issues
            }
            
        except Exception as e:
            raise Exception(f"分析图片时出错: {str(e)}")
    
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
            costPerNight
            numOfBeds
            locationType
            lat
            lng
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