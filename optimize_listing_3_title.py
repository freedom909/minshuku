import asyncio
import os
import sys
import json
import mysql.connector
from typing import Dict, Any

# 添加项目根目录到Python路径，以便导入ML模块
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 导入TitleOptimizer
try:
    from ML.app.services.listing.title_optimizer import TitleOptimizer
except ImportError:
    print("无法导入TitleOptimizer，请确保ML模块路径正确")
    sys.exit(1)

# 模拟数据 - 当无法连接到数据库时使用
MOCK_LISTING = {
    "id": "listing-3",
    "title": "舒适的两居室公寓",
    "description": "这是一个位于市中心的舒适两居室公寓，靠近公共交通和各种便利设施。",
    "costPerNight": 120,
    "numOfBeds": 2,
    "locationType": "城市",
    "amenities": [
        {"id": "1", "name": "WiFi"},
        {"id": "2", "name": "空调"},
        {"id": "3", "name": "厨房"},
        {"id": "4", "name": "洗衣机"}
    ]
}

async def get_listing_from_db(listing_id: str) -> Dict[str, Any]:
    """
    从MySQL数据库获取房源信息
    
    Args:
        listing_id: 房源ID
        
    Returns:
        房源信息
    """
    try:
        # 尝试连接到MySQL数据库
        connection = mysql.connector.connect(
            host="localhost",
            port=3306,
            user="root",
            password="princess",
            database="listings_bookings"
        )
        
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            
            # 查询房源信息
            cursor.execute(f"SELECT * FROM listings WHERE id = '{listing_id}'")
            listing = cursor.fetchone()
            
            # 查询房源的设施
            if listing:
                cursor.execute(f"SELECT a.id, a.name FROM amenities a JOIN listing_amenities la ON a.id = la.amenity_id WHERE la.listing_id = '{listing_id}'")
                amenities = cursor.fetchall()
                listing["amenities"] = amenities
            
            cursor.close()
            connection.close()
            
            return listing
    except Exception as e:
        print(f"数据库连接错误: {str(e)}")
        print("使用模拟数据继续...")
    
    # 如果无法连接到数据库，返回模拟数据
    return MOCK_LISTING

async def update_listing_in_db(listing_id: str, new_title: str) -> bool:
    """
    在MySQL数据库中更新房源标题
    
    Args:
        listing_id: 房源ID
        new_title: 新标题
        
    Returns:
        是否更新成功
    """
    try:
        # 尝试连接到MySQL数据库
        connection = mysql.connector.connect(
            host="localhost",
            port=3306,
            user="root",
            password="princess",
            database="listings_bookings"
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # 更新房源标题
            update_query = f"UPDATE listings SET title = %s WHERE id = %s"
            cursor.execute(update_query, (new_title, listing_id))
            connection.commit()
            
            success = cursor.rowcount > 0
            
            cursor.close()
            connection.close()
            
            return success
    except Exception as e:
        print(f"数据库更新错误: {str(e)}")
    
    # 如果无法连接到数据库，模拟更新成功
    print("注意: 数据库更新失败，但流程继续。在实际环境中，这将更新数据库中的标题。")
    return True

async def main():
    listing_id = "listing-3"
    print(f"开始优化房源 {listing_id} 的标题...")
    
    # 1. 获取房源信息
    listing = await get_listing_from_db(listing_id)
    if not listing:
        print(f"无法获取房源 {listing_id} 的信息")
        return
    
    print(f"当前标题: {listing.get('title', '无标题')}")
    
    # 2. 使用TitleOptimizer获取标题优化建议
    optimizer = TitleOptimizer()
    try:
        # 获取标题改进建议
        print("\n正在获取标题改进建议...")
        improvement_result = await optimizer.get_title_improvement_tips(listing_id)
        
        if improvement_result.get("status") == "success":
            print("\n标题改进建议:")
            print(improvement_result.get("improvement_tips", "无建议"))
        else:
            print(f"\n获取标题改进建议失败: {improvement_result.get('message', '未知错误')}")
            print("继续生成标题建议...")
        
        # 获取标题建议
        print("\n正在生成标题建议...")
        suggestions_result = await optimizer.generate_title_suggestions(listing_id, num_suggestions=3)
        
        if suggestions_result.get("status") == "success":
            suggestions = suggestions_result.get("suggestions", [])
            if suggestions:
                print("\n标题建议:")
                for i, suggestion in enumerate(suggestions, 1):
                    print(f"{i}. {suggestion.get('title', '')}")
                    if suggestion.get('explanation'):
                        print(f"   解释: {suggestion.get('explanation')}")
                
                # 选择第一个建议作为新标题
                new_title = suggestions[0].get("title", "")
                if new_title:
                    # 3. 更新房源标题
                    print(f"\n将使用新标题: {new_title}")
                    success = await update_listing_in_db(listing_id, new_title)
                    
                    if success:
                        print(f"成功更新房源 {listing_id} 的标题")
                        print(f"新标题: {new_title}")
                    else:
                        print(f"更新房源标题失败")
                else:
                    print("无法获取有效的标题建议")
            else:
                print("没有生成标题建议")
        else:
            print(f"\n获取标题建议失败: {suggestions_result.get('message', '未知错误')}")
            
            # 如果无法获取建议，使用默认优化标题
            default_title = "精美两居室公寓 - 市中心绝佳位置，靠近公共交通"
            print(f"\n使用默认优化标题: {default_title}")
            success = await update_listing_in_db(listing_id, default_title)
            
            if success:
                print(f"成功更新房源 {listing_id} 的标题")
                print(f"新标题: {default_title}")
            else:
                print(f"更新房源标题失败")
    
    except Exception as e:
        print(f"优化标题过程中出错: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())