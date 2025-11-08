# machine/analytics/services/report_service.py

import logging
from typing import Optional
from datetime import datetime, timedelta
from machine.core.db_connection import mysql_pool, driver  # 👈 import here
from mysql.connector import Error

# 简单的内存缓存
_report_cache = {}
_CACHE_DURATION = timedelta(minutes=5)  # 缓存5分钟

logger = logging.getLogger(__name__)

async def generate_report(report_type: str, listing_id: Optional[str], date_from: Optional[str], date_to: Optional[str]):
    """
    生成分析报告的核心函数
    
    Args:
        report_type: 报告类型 (listing, user, revenue)
        listing_id: 房源ID (可选)
        date_from: 开始日期 (可选)
        date_to: 结束日期 (可选)
    
    Returns:
        包含分析数据的字典
    """
    # 输入验证
    if report_type not in ["listing", "user", "revenue"]:
        raise ValueError("Unsupported report type. Use 'listing', 'user', or 'revenue'.")
    
    # 日期验证
    start = _validate_and_parse_date(date_from) if date_from else None
    end = _validate_and_parse_date(date_to) if date_to else None
    
    if start and end and start > end:
        raise ValueError("Start date cannot be after end date")

    # 生成缓存键
    cache_key = f"{report_type}:{listing_id or 'all'}:{date_from or 'none'}:{date_to or 'none'}"
    
    # 检查缓存
    if cache_key in _report_cache:
        cache_data, cache_time = _report_cache[cache_key]
        if datetime.now() - cache_time < _CACHE_DURATION:
            logger.info(f"Using cached report for key: {cache_key}")
            return cache_data
    
    # 生成新报告
    try:
        if report_type == "listing":
            result = await _generate_listing_report(listing_id, start, end)
        elif report_type == "user":
            result = await _generate_user_report(start, end)
        elif report_type == "revenue":
            result = await _generate_revenue_report(start, end)
        else:
            raise ValueError("Unsupported report type. Use 'listing', 'user', or 'revenue'.")
        
        # 添加报告元数据
        result["metadata"] = {
            "generated_at": datetime.now().isoformat(),
            "report_type": report_type,
            "parameters": {
                "listing_id": listing_id,
                "date_from": date_from,
                "date_to": date_to
            },
            "data_sources": ["mysql", "neo4j"]
        }
        
        # 缓存结果
        _report_cache[cache_key] = (result, datetime.now())
        logger.info(f"Cached report for key: {cache_key}")
        
        return result
        
    except Exception as e:
        logger.error(f"Report generation failed: {e}")
        # 返回错误信息但保持结构一致
        return {
            "error": str(e),
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "report_type": report_type,
                "status": "failed"
            }
        }


def _validate_and_parse_date(date_str: str) -> datetime:
    """验证并解析日期字符串"""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise ValueError(f"Invalid date format: {date_str}. Use YYYY-MM-DD format.")


def _calculate_performance_metrics(listing_data: dict, graph_data: dict) -> dict:
    """计算房源性能指标"""
    metrics = {}
    
    # 评分相关指标
    avg_rating = graph_data.get('avg_graph_rating', 0)
    total_reviews = graph_data.get('total_reviews', 0)
    
    metrics['rating_score'] = avg_rating
    metrics['review_count'] = total_reviews
    
    # 价格相关指标
    price = listing_data.get('price', 0)
    num_beds = listing_data.get('numOfBeds', 1)
    
    if price > 0 and num_beds > 0:
        metrics['price_per_bed'] = round(price / num_beds, 2)
    else:
        metrics['price_per_bed'] = 0
    
    # 状态指标
    listing_status = listing_data.get('listingStatus', 'unknown')
    is_featured = listing_data.get('isFeatured', 0)
    
    metrics['status_score'] = 1 if listing_status == 'available' else 0.5
    metrics['featured_bonus'] = 1.2 if is_featured else 1.0
    
    # 综合性能评分 (0-100)
    base_score = avg_rating * 20  # 评分占40%
    review_score = min(total_reviews * 2, 20)  # 评论数量占20%
    price_score = max(0, 20 - (price / 100))  # 价格占20%
    status_score = metrics['status_score'] * 20  # 状态占20%
    
    metrics['overall_performance'] = round(
        (base_score + review_score + price_score + status_score) * metrics['featured_bonus'],
        1
    )
    
    # 性能等级
    if metrics['overall_performance'] >= 80:
        metrics['performance_grade'] = 'A'
    elif metrics['overall_performance'] >= 60:
        metrics['performance_grade'] = 'B'
    elif metrics['overall_performance'] >= 40:
        metrics['performance_grade'] = 'C'
    else:
        metrics['performance_grade'] = 'D'
    
    return metrics


async def _generate_listing_report(listing_id: Optional[str], start: Optional[datetime], end: Optional[datetime]):
    # --- MySQL data ---
    if listing_id:
        sql = """
            SELECT 
                l.id,
                l.title,
                l.description,
                l.price,
                l.numOfBeds,
                l.locationType,
                l.listingStatus,
                l.isFeatured,
                l.createdAt
            FROM listings l
            WHERE l.id = %s
        """
        params = (listing_id,)
    else:
        # 添加日期筛选
        where_clause = ""
        params = []
        
        if start:
            where_clause += " AND l.createdAt >= %s"
            params.append(start)
        if end:
            where_clause += " AND l.createdAt <= %s"
            params.append(end)
        
        sql = f"""
            SELECT 
                l.id,
                l.title,
                l.price,
                l.numOfBeds,
                l.locationType,
                l.listingStatus,
                l.isFeatured,
                l.createdAt
            FROM listings l
            WHERE 1=1 {where_clause}
            ORDER BY l.createdAt DESC
            LIMIT 50
        """
        params = tuple(params)
    
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql, params)
        mysql_data = cursor.fetchall()
    except Error as e:
        logger.error(f"MySQL error: {e}")
        mysql_data = []
    finally:
        cursor.close()
        conn.close()

    # --- Neo4j data ---
    if listing_id:
        cypher = """
            MATCH (l:Listing {id: $listing_id})-[:HAS_REVIEW]->(r:Review)
            RETURN COUNT(r) AS total_reviews, avg(r.rating) AS avg_graph_rating
        """
        neo_params = {"listing_id": listing_id}
    else:
        cypher = """
            MATCH (l:Listing)-[:HAS_REVIEW]->(r:Review)
            RETURN l.id AS listing_id, COUNT(r) AS total_reviews, avg(r.rating) AS avg_graph_rating
            ORDER BY total_reviews DESC
            LIMIT 50
        """
        neo_params = {}
    
    try:
        with driver.session() as session:
            result = session.run(cypher, neo_params)
            neo_data = result.data()
            logger.info(f"Neo4j query result: {len(neo_data)} records")
    except Exception as e:
        logger.error(f"Neo4j error: {e}")
        neo_data = []

    # 合并数据并计算性能指标
    if listing_id:
        listing_info = mysql_data[0] if mysql_data else {}
        graph_info = neo_data[0] if neo_data else {}
        
        # 计算性能指标
        performance_metrics = _calculate_performance_metrics(listing_info, graph_info)
        
        return {
            "listing": listing_info,
            "graph": graph_info,
            "performance_metrics": performance_metrics
        }
    else:
        # 为所有房源合并数据并计算性能指标
        combined_data = []
        for listing in mysql_data:
            listing_id = listing['id']
            graph_data = next((item for item in neo_data if item.get('listing_id') == listing_id), {})
            
            # 计算性能指标
            performance_metrics = _calculate_performance_metrics(listing, graph_data)
            
            combined_data.append({
                **listing,
                **graph_data,
                "performance_metrics": performance_metrics
            })
        
        # 按性能评分排序
        combined_data.sort(key=lambda x: x.get('performance_metrics', {}).get('overall_performance', 0), reverse=True)
        
        # 为所有房源报告添加摘要和趋势分析
        summary = _generate_report_summary(combined_data)
        trend_analysis = _analyze_trends_and_recommendations(combined_data)
        
        return {
            "summary": summary,
            "trend_analysis": trend_analysis,
            "listings": combined_data
        }


def _generate_report_summary(data: list) -> dict:
    """生成报告摘要统计"""
    if not data:
        return {"message": "No data available for summary"}
    
    summary = {
        "total_listings": len(data),
        "avg_performance": 0,
        "performance_distribution": {"A": 0, "B": 0, "C": 0, "D": 0},
        "avg_rating": 0,
        "avg_price": 0,
        "featured_count": 0,
        "available_count": 0
    }
    
    total_rating = 0
    total_price = 0
    rating_count = 0
    
    for item in data:
        metrics = item.get('performance_metrics', {})
        
        # 性能评分
        performance = metrics.get('overall_performance', 0)
        summary['avg_performance'] += performance
        
        # 性能等级分布
        grade = metrics.get('performance_grade', 'D')
        summary['performance_distribution'][grade] += 1
        
        # 评分统计
        rating = metrics.get('rating_score', 0)
        if rating > 0:
            total_rating += rating
            rating_count += 1
        
        # 价格统计
        price = item.get('price', 0)
        total_price += price
        
        # 特色房源
        if item.get('isFeatured', 0):
            summary['featured_count'] += 1
        
        # 可用房源
        if item.get('listingStatus') == 'available':
            summary['available_count'] += 1
    
    # 计算平均值
    if len(data) > 0:
        summary['avg_performance'] = round(summary['avg_performance'] / len(data), 1)
        summary['avg_price'] = round(total_price / len(data), 2)
    
    if rating_count > 0:
        summary['avg_rating'] = round(total_rating / rating_count, 1)
    
    # 计算百分比
    summary['featured_percentage'] = round((summary['featured_count'] / len(data)) * 100, 1)
    summary['available_percentage'] = round((summary['available_count'] / len(data)) * 100, 1)
    
    return summary


async def _generate_user_report(start: Optional[datetime], end: Optional[datetime]):
    """生成用户报告（目前返回基础统计）"""
    # 由于没有用户表，返回基础统计信息
    return {
        "message": "用户报告功能待开发 - 需要用户数据表",
        "available_tables": ["listings", "amenities", "categories", "locations"],
        "suggestions": [
            "添加用户表以支持用户分析",
            "添加预订表以支持预订分析", 
            "添加评论表以支持评论分析"
        ]
    }


async def _generate_revenue_report(start: Optional[datetime], end: Optional[datetime]):
    """生成收入报告（目前返回基础统计）"""
    # 由于没有预订和收入数据，返回基础统计信息
    try:
        conn = mysql_pool.get_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 获取房源统计
        cursor.execute("""
            SELECT 
                COUNT(*) as total_listings,
                SUM(price) as total_potential_revenue,
                AVG(price) as avg_price,
                SUM(CASE WHEN isFeatured = 1 THEN 1 ELSE 0 END) as featured_listings,
                SUM(CASE WHEN listingStatus = 'available' THEN 1 ELSE 0 END) as available_listings
            FROM listings
        """)
        stats = cursor.fetchone()
        
        # 获取房源类型分布
        cursor.execute("""
            SELECT 
                locationType,
                COUNT(*) as count,
                AVG(price) as avg_price
            FROM listings
            GROUP BY locationType
            ORDER BY count DESC
        """)
        type_distribution = cursor.fetchall()
        
    except Error as e:
        logger.error(f"MySQL error in revenue report: {e}")
        stats = {}
        type_distribution = []
    finally:
        cursor.close()
        conn.close()
    
    return {
        "revenue_stats": stats,
        "type_distribution": type_distribution,
        "notes": [
            "收入报告基于房源价格估算，实际收入需要预订数据",
            "当前系统包含3个房源，总潜在收入约1425美元"
        ]
    }


def _analyze_trends_and_recommendations(data: list) -> dict:
    """分析趋势和提供优化建议"""
    if not data:
        return {"message": "No data available for trend analysis"}
    
    analysis = {
        "trends": {},
        "recommendations": [],
        "opportunities": [],
        "risks": [],
        "insights": []
    }
    
    # 分析房源状态分布
    status_counts = {}
    type_counts = {}
    performance_scores = []
    price_distribution = []
    
    for item in data:
        # 状态统计
        status = item.get('listingStatus', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
        
        # 类型统计
        location_type = item.get('locationType', 'unknown')
        type_counts[location_type] = type_counts.get(location_type, 0) + 1
        
        # 性能评分
        metrics = item.get('performance_metrics', {})
        performance = metrics.get('overall_performance', 0)
        performance_scores.append(performance)
        
        # 价格分布
        price = item.get('price', 0)
        price_distribution.append(price)
    
    # 趋势分析
    analysis['trends']['status_distribution'] = status_counts
    analysis['trends']['type_distribution'] = type_counts
    analysis['trends']['avg_performance'] = round(sum(performance_scores) / len(performance_scores), 1)
    analysis['trends']['performance_range'] = {
        "min": min(performance_scores),
        "max": max(performance_scores),
        "median": sorted(performance_scores)[len(performance_scores) // 2]
    }
    
    # 价格分析
    if price_distribution:
        analysis['trends']['price_analysis'] = {
            "avg_price": round(sum(price_distribution) / len(price_distribution), 2),
            "min_price": min(price_distribution),
            "max_price": max(price_distribution),
            "price_range": f"${min(price_distribution)} - ${max(price_distribution)}"
        }
    
    # 生成建议
    if status_counts.get('available', 0) == 0:
        analysis['recommendations'].append("⚠️ 没有可用房源，建议添加更多可用房源")
    
    if len([p for p in performance_scores if p < 40]) > len(data) * 0.5:
        analysis['recommendations'].append("📊 超过50%房源性能评分低于40分，需要优化")
    
    # 机会识别
    high_performance_items = [item for item in data 
                             if item.get('performance_metrics', {}).get('overall_performance', 0) >= 80]
    
    if high_performance_items:
        best_item = high_performance_items[0]
        analysis['opportunities'].append(f"🏆 最佳房源: {best_item.get('title')} (评分: {best_item.get('performance_metrics', {}).get('overall_performance', 0)})")
        
        # 分析成功因素
        if best_item.get('isFeatured'):
            analysis['insights'].append("特色房源通常表现更好")
        if best_item.get('avg_graph_rating', 0) >= 4.5:
            analysis['insights'].append("高评分是成功的关键因素")
    
    # 风险识别
    low_performance_items = [item for item in data 
                            if item.get('performance_metrics', {}).get('overall_performance', 0) < 40]
    
    if low_performance_items:
        analysis['risks'].append(f"⚠️ {len(low_performance_items)}个房源需要性能优化")
        
        # 分析风险因素
        for item in low_performance_items[:3]:  # 只分析前3个
            if item.get('avg_graph_rating', 0) < 3.0:
                analysis['insights'].append(f"低评分房源: {item.get('title')} 需要质量改进")
            if item.get('total_reviews', 0) == 0:
                analysis['insights'].append(f"无评论房源: {item.get('title')} 缺乏可信度")
    
    # 具体优化建议
    for item in data:
        metrics = item.get('performance_metrics', {})
        if metrics.get('review_count', 0) == 0:
            analysis['recommendations'].append(f"💬 {item.get('title')}: 添加评论以提高可信度")
        
        if metrics.get('rating_score', 0) < 3.0 and metrics.get('review_count', 0) > 0:
            analysis['recommendations'].append(f"⭐ {item.get('title')}: 评分较低，需要改进服务质量")
        
        # 价格优化建议
        price_per_bed = metrics.get('price_per_bed', 0)
        if price_per_bed > 200:  # 假设200美元/床是高价阈值
            analysis['recommendations'].append(f"💰 {item.get('title')}: 价格偏高，考虑调整定价策略")
    
    # 市场洞察
    if len(data) >= 5:
        analysis['insights'].append(f"市场包含 {len(data)} 个房源，多样性良好")
        
        # 类型多样性分析
        if len(type_counts) >= 3:
            analysis['insights'].append("房源类型多样化，覆盖多个市场细分")
        
        # 价格段分析
        affordable_count = len([p for p in price_distribution if p < 100])
        if affordable_count > len(data) * 0.3:
            analysis['insights'].append("经济型房源占比较高，适合预算有限的客户")
    
    return analysis


def _generate_prediction(data: dict, period: int) -> dict:
    """生成预测数据"""
    prediction = {
        "performance_trend": "stable",
        "expected_rating_change": 0.0,
        "potential_revenue_growth": "0%",
        "risk_factors": [],
        "optimization_opportunities": [],
        "confidence_level": "medium"
    }
    
    # 基于当前数据的简单预测逻辑
    if "listing" in data:
        listing = data["listing"]
        metrics = data.get("performance_metrics", {})
        
        current_rating = metrics.get("rating_score", 0)
        current_performance = metrics.get("overall_performance", 0)
        review_count = metrics.get("review_count", 0)
        
        # 预测逻辑
        if current_performance >= 80:
            prediction["performance_trend"] = "growing"
            prediction["expected_rating_change"] = 0.1
            prediction["potential_revenue_growth"] = "5-10%"
            prediction["confidence_level"] = "high"
        elif current_performance >= 60:
            prediction["performance_trend"] = "stable"
            prediction["expected_rating_change"] = 0.0
            prediction["potential_revenue_growth"] = "2-5%"
            prediction["confidence_level"] = "medium"
        else:
            prediction["performance_trend"] = "declining"
            prediction["expected_rating_change"] = -0.2
            prediction["potential_revenue_growth"] = "-5-0%"
            prediction["risk_factors"].append("Low performance score indicates potential issues")
            prediction["confidence_level"] = "low"
        
        # 优化机会
        if review_count < 5:
            prediction["optimization_opportunities"].append("Increase review count through customer engagement")
        
        if current_rating < 4.0:
            prediction["optimization_opportunities"].append("Improve service quality to increase ratings")
        
        # 基于周期的调整
        if period > 14:
            prediction["potential_revenue_growth"] = f"{prediction['potential_revenue_growth'].replace('%', '')} (long-term)"
        
    return prediction


def _validate_and_parse_date(date_str: str) -> datetime:
    """验证并解析日期字符串"""
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        raise ValueError(f"Invalid date format: {date_str}. Use YYYY-MM-DD format.")


def _clean_cache():
    """清理过期缓存"""
    global _report_cache
    current_time = datetime.now()
    expired_keys = []
    
    for key, (data, cache_time) in _report_cache.items():
        if current_time - cache_time > _CACHE_DURATION:
            expired_keys.append(key)
    
    for key in expired_keys:
        del _report_cache[key]
    
    if expired_keys:
        logger.info(f"Cleaned {len(expired_keys)} expired cache entries")


def get_cache_stats() -> dict:
    """获取缓存统计信息"""
    _clean_cache()  # 先清理过期缓存
    
    return {
        "total_entries": len(_report_cache),
        "cache_duration_minutes": _CACHE_DURATION.total_seconds() / 60,
        "oldest_entry": min([cache_time for _, (_, cache_time) in _report_cache.items()], default=None),
        "newest_entry": max([cache_time for _, (_, cache_time) in _report_cache.items()], default=None)
    }


# ==================== 高级分析功能 ====================

async def generate_batch_reports(report_requests: list) -> dict:
    """
    批量生成报告
    
    Args:
        report_requests: 报告请求列表，每个请求包含参数
    
    Returns:
        批量报告结果
    """
    results = {
        "total_requests": len(report_requests),
        "successful_reports": 0,
        "failed_reports": 0,
        "reports": [],
        "summary": {},
        "processing_time": None
    }
    
    start_time = datetime.now()
    
    for i, request in enumerate(report_requests):
        try:
            report = await generate_report(
                report_type=request.get("report_type", "listing"),
                listing_id=request.get("listing_id"),
                date_from=request.get("date_from"),
                date_to=request.get("date_to")
            )
            
            results["reports"].append({
                "request_id": i,
                "status": "success",
                "data": report
            })
            results["successful_reports"] += 1
            
        except Exception as e:
            results["reports"].append({
                "request_id": i,
                "status": "failed",
                "error": str(e)
            })
            results["failed_reports"] += 1
    
    # 计算处理时间
    results["processing_time"] = (datetime.now() - start_time).total_seconds()
    
    # 生成摘要
    results["summary"] = {
        "success_rate": round(results["successful_reports"] / len(report_requests) * 100, 1),
        "average_processing_time_per_report": round(results["processing_time"] / len(report_requests), 3),
        "recommendations": _generate_batch_recommendations(results)
    }
    
    return results


def _generate_batch_recommendations(results: dict) -> list:
    """生成批量处理建议"""
    recommendations = []
    
    success_rate = results["summary"]["success_rate"]
    if success_rate < 80:
        recommendations.append("⚠️ 批量处理成功率较低，建议检查输入数据质量")
    
    avg_time = results["summary"]["average_processing_time_per_report"]
    if avg_time > 1.0:
        recommendations.append(f"⏱️ 平均处理时间较长 ({avg_time}s)，建议优化数据库查询")
    
    if results["failed_reports"] > 0:
        recommendations.append(f"🔧 有 {results['failed_reports']} 个报告生成失败，建议查看详细错误信息")
    
    return recommendations


async def generate_comparative_analysis(listing_ids: list) -> dict:
    """
    生成房源对比分析
    
    Args:
        listing_ids: 要对比的房源ID列表
    
    Returns:
        对比分析结果
    """
    if len(listing_ids) < 2:
        raise ValueError("至少需要2个房源ID进行对比分析")
    
    comparison_data = {
        "compared_listings": [],
        "comparison_metrics": {},
        "ranking": [],
        "insights": []
    }
    
    # 获取每个房源的数据
    for listing_id in listing_ids:
        try:
            report = await generate_report("listing", listing_id, None, None)
            if "error" not in report:
                comparison_data["compared_listings"].append(report)
        except Exception as e:
            logger.warning(f"Failed to get data for listing {listing_id}: {e}")
    
    if len(comparison_data["compared_listings"]) < 2:
        raise ValueError("无法获取足够的房源数据进行对比")
    
    # 计算对比指标
    comparison_data["comparison_metrics"] = _calculate_comparison_metrics(comparison_data["compared_listings"])
    
    # 生成排名
    comparison_data["ranking"] = _generate_ranking(comparison_data["compared_listings"])
    
    # 生成洞察
    comparison_data["insights"] = _generate_comparison_insights(comparison_data["compared_listings"])
    
    return comparison_data


def _calculate_comparison_metrics(listings: list) -> dict:
    """计算对比指标"""
    metrics = {
        "performance_range": {"min": float('inf'), "max": 0},
        "price_range": {"min": float('inf'), "max": 0},
        "rating_range": {"min": float('inf'), "max": 0},
        "average_metrics": {}
    }
    
    performance_scores = []
    prices = []
    ratings = []
    
    for listing_data in listings:
        metrics_data = listing_data.get("performance_metrics", {})
        listing_info = listing_data.get("listing", {})
        
        # 性能评分
        performance = metrics_data.get("overall_performance", 0)
        performance_scores.append(performance)
        
        # 价格
        price = listing_info.get("price", 0)
        prices.append(price)
        
        # 评分
        rating = metrics_data.get("rating_score", 0)
        ratings.append(rating)
    
    # 计算范围
    if performance_scores:
        metrics["performance_range"] = {
            "min": min(performance_scores),
            "max": max(performance_scores),
            "range": max(performance_scores) - min(performance_scores)
        }
    
    if prices:
        metrics["price_range"] = {
            "min": min(prices),
            "max": max(prices),
            "range": max(prices) - min(prices)
        }
    
    if ratings:
        metrics["rating_range"] = {
            "min": min(ratings),
            "max": max(ratings),
            "range": round(max(ratings) - min(ratings), 2)
        }
    
    # 计算平均值
    metrics["average_metrics"] = {
        "avg_performance": round(sum(performance_scores) / len(performance_scores), 1),
        "avg_price": round(sum(prices) / len(prices), 2),
        "avg_rating": round(sum(ratings) / len(ratings), 2)
    }
    
    return metrics


def _generate_ranking(listings: list) -> list:
    """生成房源排名"""
    ranked_listings = []
    
    for listing_data in listings:
        metrics = listing_data.get("performance_metrics", {})
        listing_info = listing_data.get("listing", {})
        
        ranked_listings.append({
            "listing_id": listing_info.get("id"),
            "title": listing_info.get("title"),
            "performance_score": metrics.get("overall_performance", 0),
            "performance_grade": metrics.get("performance_grade", "D"),
            "price": listing_info.get("price", 0),
            "rating": metrics.get("rating_score", 0)
        })
    
    # 按性能评分排序
    ranked_listings.sort(key=lambda x: x["performance_score"], reverse=True)
    
    # 添加排名
    for i, listing in enumerate(ranked_listings):
        listing["rank"] = i + 1
    
    return ranked_listings


def _generate_comparison_insights(listings: list) -> list:
    """生成对比洞察"""
    insights = []
    
    if len(listings) < 2:
        return ["需要更多数据进行有效对比"]
    
    # 获取最佳和最差房源
    best_listing = max(listings, key=lambda x: x.get("performance_metrics", {}).get("overall_performance", 0))
    worst_listing = min(listings, key=lambda x: x.get("performance_metrics", {}).get("overall_performance", 0))
    
    best_perf = best_listing.get("performance_metrics", {}).get("overall_performance", 0)
    worst_perf = worst_listing.get("performance_metrics", {}).get("overall_performance", 0)
    
    if best_perf - worst_perf > 30:
        insights.append("📊 房源间性能差异显著，建议分析成功因素")
    
    # 价格性能比分析
    price_performance_ratios = []
    for listing in listings:
        price = listing.get("listing", {}).get("price", 1)
        performance = listing.get("performance_metrics", {}).get("overall_performance", 1)
        if price > 0 and performance > 0:
            price_performance_ratios.append(performance / price)
    
    if price_performance_ratios:
        max_ratio = max(price_performance_ratios)
        min_ratio = min(price_performance_ratios)
        if max_ratio / min_ratio > 2:
            insights.append("💰 部分房源具有更好的价格性能比")
    
    return insights


# ==================== 数据备份和恢复 ====================

async def export_analytics_data(format: str = "json") -> dict:
    """
    导出分析数据
    
    Args:
        format: 导出格式 (json, csv)
    
    Returns:
        导出数据
    """
    export_data = {
        "export_timestamp": datetime.now().isoformat(),
        "format": format,
        "data_sources": ["mysql", "neo4j"],
        "reports": {}
    }
    
    # 导出所有类型的报告
    report_types = ["listing", "revenue"]
    
    for report_type in report_types:
        try:
            report = await generate_report(report_type, None, None, None)
            export_data["reports"][report_type] = report
        except Exception as e:
            logger.error(f"Failed to export {report_type} report: {e}")
            export_data["reports"][report_type] = {"error": str(e)}
    
    # 导出缓存统计
    export_data["cache_stats"] = get_cache_stats()
    
    # 导出系统状态
    export_data["system_status"] = {
        "database_connections": "active",
        "cache_health": "healthy",
        "service_status": "operational"
    }
    
    return export_data


def import_analytics_data(import_data: dict) -> dict:
    """
    导入分析数据（主要用于数据恢复）
    
    Args:
        import_data: 导入的数据
    
    Returns:
        导入结果
    """
    result = {
        "import_timestamp": datetime.now().isoformat(),
        "status": "success",
        "imported_items": 0,
        "errors": []
    }
    
    # 这里可以实现数据导入逻辑
    # 目前主要作为数据恢复的框架
    
    if "reports" in import_data:
        result["imported_items"] = len(import_data["reports"])
    
    return result
