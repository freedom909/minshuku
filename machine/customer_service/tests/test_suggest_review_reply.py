# customer_service/tests/test_suggest_review_reply.py
"""Tests for review reply suggestion service"""

import pytest
from machine.customer_service.services.suggest_review_reply import suggest_review_reply

def test_positive_review_reply():
    """测试正面评论的回复生成"""
    review_data = {
        "reviewId": "test-positive-001",
        "reviewContent": "房间非常干净整洁，服务人员态度热情，地理位置优越",
        "reviewRating": 4.8,
        "reviewerName": "满意顾客"
    }
    
    result = suggest_review_reply(review_data)
    
    assert "suggested_replies" in result
    assert len(result["suggested_replies"]) == 3
    assert result["sentiment_analysis"] == "positive"
    assert "服务" in result["key_points_addressed"]
    assert "卫生" in result["key_points_addressed"]

def test_neutral_review_reply():
    """测试中性评论的回复生成"""
    review_data = {
        "reviewId": "test-neutral-001",
        "reviewContent": "整体还可以，但WiFi信号不太稳定",
        "reviewRating": 3.5,
        "reviewerName": "普通旅客"
    }
    
    result = suggest_review_reply(review_data)
    
    assert "suggested_replies" in result
    assert result["sentiment_analysis"] == "neutral"
    assert "设施" in result["key_points_addressed"]

def test_negative_review_reply():
    """测试负面评论的回复生成"""
    review_data = {
        "reviewId": "test-negative-001",
        "reviewContent": "非常失望，房间有异味，服务态度差",
        "reviewRating": 2.0,
        "reviewerName": "不满意顾客"
    }
    
    result = suggest_review_reply(review_data)
    
    assert "suggested_replies" in result
    assert result["sentiment_analysis"] == "negative"
    assert "卫生" in result["key_points_addressed"]
    assert "服务" in result["key_points_addressed"]

def test_missing_required_fields():
    """测试缺少必需字段的情况"""
    review_data = {
        "reviewId": "test-missing-001",
        "reviewContent": "测试评论"
        # 缺少 reviewRating 和 reviewerName
    }
    
    result = suggest_review_reply(review_data)
    
    assert "error" in result
    assert "Missing required field" in result["error"]

def test_empty_review_content():
    """测试空评论内容"""
    review_data = {
        "reviewId": "test-empty-001",
        "reviewContent": "",
        "reviewRating": 4.0,
        "reviewerName": "测试用户"
    }
    
    result = suggest_review_reply(review_data)
    
    assert "suggested_replies" in result
    assert len(result["suggested_replies"]) == 3

def test_high_confidence_positive():
    """测试高置信度的正面评论"""
    review_data = {
        "reviewId": "test-high-conf-001",
        "reviewContent": "完美！无可挑剔的体验！",
        "reviewRating": 5.0,
        "reviewerName": "极致满意"
    }
    
    result = suggest_review_reply(review_data)
    
    assert result["confidence_score"] >= 0.9

def test_review_with_special_characters():
    """测试包含特殊字符的评论"""
    review_data = {
        "reviewId": "test-special-001",
        "reviewContent": "房间👍，服务💯，位置🚇方便！",
        "reviewRating": 4.7,
        "reviewerName": "Emoji用户"
    }
    
    result = suggest_review_reply(review_data)
    
    assert "suggested_replies" in result
    assert result["sentiment_analysis"] == "positive"

if __name__ == "__main__":
    # 运行测试
    test_positive_review_reply()
    test_neutral_review_reply() 
    test_negative_review_reply()
    test_missing_required_fields()
    test_empty_review_content()
    test_high_confidence_positive()
    test_review_with_special_characters()
    
    print("✅ All tests passed!")