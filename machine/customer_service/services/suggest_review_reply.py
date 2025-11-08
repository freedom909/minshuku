# customer_service/services/suggest_review_reply.py
"""Review Reply Suggestion Service - 评论回复建议生成"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)

def suggest_review_reply(review_data: Dict) -> Dict:
    """
    生成评论回复建议
    
    Args:
        review_data: 包含评论信息的字典
            - reviewId: 评论ID
            - reviewContent: 评论内容
            - reviewRating: 评分
            - reviewerName: 评论者昵称
            - listingId: 房源ID (可选)
    
    Returns:
        包含回复建议的字典
    """
    try:
        logger.info(f"Generating review reply suggestions for review: {review_data.get('reviewId')}")
        
        # 验证输入数据
        required_fields = ['reviewId', 'reviewContent', 'reviewRating', 'reviewerName']
        for field in required_fields:
            if field not in review_data:
                return {
                    "error": f"Missing required field: {field}",
                    "example_input": {
                        "reviewId": "review-001",
                        "reviewContent": "房间很干净，服务很好",
                        "reviewRating": 4.5,
                        "reviewerName": "旅行者"
                    }
                }
        
        # 分析评论情感
        sentiment = _analyze_sentiment(review_data['reviewContent'], review_data['reviewRating'])
        
        # 提取评论关键点
        key_points = _extract_key_points(review_data['reviewContent'])
        
        # 生成回复建议
        suggested_replies = _generate_reply_suggestions(
            review_data['reviewContent'],
            review_data['reviewRating'],
            review_data['reviewerName'],
            sentiment,
            key_points
        )
        
        return {
            "reviewId": review_data['reviewId'],
            "suggested_replies": suggested_replies,
            "sentiment_analysis": sentiment,
            "key_points_addressed": key_points,
            "generation_timestamp": datetime.now().isoformat(),
            "confidence_score": _calculate_confidence(sentiment, review_data['reviewRating'])
        }
        
    except Exception as e:
        logger.error(f"Error generating review reply suggestions: {e}")
        return {"error": str(e)}

def _analyze_sentiment(review_content: str, rating: float) -> str:
    """分析评论情感"""
    positive_keywords = ['好', '不错', '满意', '干净', '舒适', '方便', '推荐', '喜欢', '棒', '赞']
    negative_keywords = ['差', '不好', '不满意', '脏', '吵', '不方便', '不推荐', '失望']
    
    positive_count = sum(1 for keyword in positive_keywords if keyword in review_content)
    negative_count = sum(1 for keyword in negative_keywords if keyword in review_content)
    
    if rating >= 4.0:
        return "positive"
    elif rating >= 3.0:
        return "neutral"
    else:
        return "negative"

def _extract_key_points(review_content: str) -> List[str]:
    """提取评论中的关键点"""
    key_points = []
    
    # 常见的关键点分类
    categories = {
        "服务": ['服务', '接待', '帮助', '态度', '热情'],
        "设施": ['房间', '床', '卫生间', '厨房', '空调', 'WiFi'],
        "卫生": ['干净', '整洁', '卫生', '清洁'],
        "位置": ['位置', '交通', '方便', '附近', '周边'],
        "价格": ['价格', '性价比', '划算', '值得']
    }
    
    for category, keywords in categories.items():
        if any(keyword in review_content for keyword in keywords):
            key_points.append(category)
    
    return key_points if key_points else ["整体体验"]

def _generate_reply_suggestions(content: str, rating: float, reviewer_name: str, 
                               sentiment: str, key_points: List[str]) -> List[str]:
    """生成回复建议"""
    
    base_templates = {
        "positive": [
            "感谢{name}的五星好评！我们很高兴您喜欢我们的{features}，期待您下次光临！",
            "谢谢{name}的认可！您的满意是我们最大的动力，我们会继续努力提供更好的服务！",
            "非常感谢{name}的宝贵评价！很高兴我们的{features}能让您满意，欢迎常来！"
        ],
        "neutral": [
            "感谢{name}的评价！我们会认真考虑您的反馈，努力改进{features}。",
            "谢谢{name}的意见！您的建议对我们很重要，我们会持续优化{features}。",
            "感谢{name}的反馈！我们会在{features}方面继续努力，期待给您更好的体验。"
        ],
        "negative": [
            "感谢{name}的反馈，对于{issues}给您带来的不便我们深感抱歉。我们会立即改进。",
            "谢谢{name}的意见，我们非常重视您的体验。关于{issues}的问题我们会认真处理。",
            "抱歉{name}，让您有不愉快的体验。我们会加强{issues}的管理，期待您的再次光临。"
        ]
    }
    
    # 根据评分调整模板
    if rating >= 4.5:
        templates = base_templates["positive"]
        features = "、".join(key_points)
        issues = ""
    elif rating >= 3.5:
        templates = base_templates["neutral"]
        features = "、".join(key_points)
        issues = ""
    else:
        templates = base_templates["negative"]
        features = ""
        issues = "、".join(key_points)
    
    # 生成具体回复
    suggestions = []
    for template in templates:
        reply = template.format(
            name=reviewer_name if reviewer_name else "您",
            features=features,
            issues=issues
        )
        suggestions.append(reply)
    
    return suggestions

def _calculate_confidence(sentiment: str, rating: float) -> float:
    """计算回复建议的置信度"""
    base_confidence = 0.8
    
    # 根据情感调整置信度
    if sentiment == "positive" and rating >= 4.0:
        return min(base_confidence + 0.15, 1.0)
    elif sentiment == "negative" and rating <= 2.0:
        return min(base_confidence + 0.1, 1.0)
    else:
        return base_confidence

# 测试函数
def test_suggest_review_reply():
    """测试回复建议生成"""
    test_cases = [
        {
            "reviewId": "review-001",
            "reviewContent": "房间很干净，服务态度很好，位置也很方便",
            "reviewRating": 4.8,
            "reviewerName": "快乐旅行者"
        },
        {
            "reviewId": "review-002", 
            "reviewContent": "卫生一般，WiFi信号不太稳定",
            "reviewRating": 3.2,
            "reviewerName": "商务客人"
        },
        {
            "reviewId": "review-003",
            "reviewContent": "非常失望，房间有异味，服务也不好",
            "reviewRating": 1.5,
            "reviewerName": "不满意顾客"
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n=== 测试案例 {i} ===")
        result = suggest_review_reply(test_case)
        print(f"输入: {test_case}")
        print(f"输出: {result}")

if __name__ == "__main__":
    test_suggest_review_reply()