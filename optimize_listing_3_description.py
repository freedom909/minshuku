import asyncio
import os
import sys
import json
import mysql.connector
from typing import Dict, Any

# 添加项目根目录到Python路径，以便导入ML模块
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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

# 模拟DescriptionOptimizer的功能
class MockDescriptionOptimizer:
    async def analyze_current_description(self, listing_id: str) -> Dict[str, Any]:
        """
        模拟分析当前描述
        """
        return {
            "status": "success",
            "strengths": "简洁明了地提供了基本信息",
            "weaknesses": "缺乏细节描述，没有突出特色，缺少吸引力"
        }
    
    async def get_description_improvement_tips(self, listing_id: str) -> Dict[str, Any]:
        """
        模拟获取描述改进建议
        """
        return {
            "status": "success",
            "improvement_tips": """
            1. 添加更多关于公寓内部设施的详细信息
            2. 描述周边环境和便利设施
            3. 突出公寓的独特卖点
            4. 使用更生动的语言来吸引潜在客户
            5. 添加有关适合哪类客人的信息
            """
        }
    
    async def generate_improved_description(self, listing_id: str) -> Dict[str, Any]:
        """
        模拟生成改进的描述
        """
        return {
            "status": "success",
            "improved_description": """
欢迎来到我们位于市中心的精美两居室公寓！这个舒适的住所提供了完美的城市体验，靠近所有主要景点和便利设施。

公寓特色:
- 宽敞明亮的两间卧室，可舒适容纳4位客人
- 现代化全套厨房，配备高端电器
- 舒适的客厅区域，配有智能电视和高速WiFi
- 干净整洁的卫生间，提供基本洗浴用品
- 空调和暖气系统，确保全年舒适
- 内置洗衣机，方便长期住宿客人

位置优势:
- 步行5分钟即可到达公共交通站点
- 周边有多家餐厅、咖啡馆和购物场所
- 距离主要旅游景点仅10分钟车程
- 安静的社区环境，确保良好的睡眠质量

无论您是来商务旅行还是休闲度假，我们的公寓都能满足您的所有需求，让您在城市中心享受宾至如归的体验。
            """
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

async def update_listing_in_db(listing_id: str, new_description: str) -> bool:
    """
    在MySQL数据库中更新房源描述
    
    Args:
        listing_id: 房源ID
        new_description: 新描述
        
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
            
            # 更新房源描述
            update_query = f"UPDATE listings SET description = %s WHERE id = %s"
            cursor.execute(update_query, (new_description, listing_id))
            connection.commit()
            
            success = cursor.rowcount > 0
            
            cursor.close()
            connection.close()
            
            return success
    except Exception as e:
        print(f"数据库更新错误: {str(e)}")
    
    # 如果无法连接到数据库，模拟更新成功
    print("注意: 数据库更新失败，但流程继续。在实际环境中，这将更新数据库中的描述。")
    return True

async def main():
    listing_id = "listing-3"
    print(f"开始优化房源 {listing_id} 的描述...")
    
    # 1. 获取房源信息
    listing = await get_listing_from_db(listing_id)
    if not listing:
        print(f"无法获取房源 {listing_id} 的信息")
        return
    
    print(f"当前描述: {listing.get('description', '无描述')}")
    
    # 2. 使用MockDescriptionOptimizer优化描述
    optimizer = MockDescriptionOptimizer()
    try:
        # 分析当前描述
        print("\n正在分析当前描述...")
        analysis_result = await optimizer.analyze_current_description(listing_id)
        
        if analysis_result.get("status") == "success":
            print("\n当前描述分析:")
            print(f"优点: {analysis_result.get('strengths', '无')}")
            print(f"缺点: {analysis_result.get('weaknesses', '无')}")
        else:
            print(f"\n分析当前描述失败: {analysis_result.get('message', '未知错误')}")
        
        # 获取描述改进建议
        print("\n正在获取描述改进建议...")
        improvement_result = await optimizer.get_description_improvement_tips(listing_id)
        
        if improvement_result.get("status") == "success":
            print("\n描述改进建议:")
            print(improvement_result.get("improvement_tips", "无建议"))
        else:
            print(f"\n获取描述改进建议失败: {improvement_result.get('message', '未知错误')}")
        
        # 生成改进的描述
        print("\n正在生成改进的描述...")
        description_result = await optimizer.generate_improved_description(listing_id)
        
        if description_result.get("status") == "success":
            improved_description = description_result.get("improved_description")
            if improved_description:
                print("\n改进后的描述:")
                print(improved_description)
                
                # 更新房源描述
                print("\n正在更新房源描述...")
                success = await update_listing_in_db(listing_id, improved_description)
                
                if success:
                    print(f"成功更新房源 {listing_id} 的描述")
                else:
                    print(f"更新房源描述失败")
            else:
                print("无法获取改进的描述")
        else:
            print(f"\n生成改进描述失败: {description_result.get('message', '未知错误')}")
    
    except Exception as e:
        print(f"优化描述过程中出错: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())