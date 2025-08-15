"""
测试房源优化服务

这个脚本演示如何使用 ListingOptimizer 类来优化特定房源。
"""

from listing_optimizer import ListingOptimizer

def test_listing_optimization():
    # 创建优化器实例
    optimizer = ListingOptimizer()
    
    # 示例房源数据（listing-10）
    listing_data = {
        'id': 'listing-10',
        'title': '现代公寓',
        'description': '你会喜欢这里的',
        'price': '150',
        'numOfBeds': '2',
        'locationType': 'APARTMENT',
        'pictures': ['front.jpg', 'room1.jpg', 'kitchen.jpg'],
        'bookingNumber': '85'
    }
    
    print("\n=== 房源优化分析报告 ===")
    print(f"房源ID: {listing_data['id']}")
    
    # 1. 标题优化
    print("\n【标题优化建议】")
    title_suggestions = optimizer.optimize_title(listing_data)
    print("当前标题:", title_suggestions['current_title'])
    print("\n存在的问题:")
    for issue in title_suggestions['title_issues']:
        print(f"• {issue}")
    print("\n建议标题:")
    for title in title_suggestions['suggested_titles']:
        print(f"• {title}")
    
    # 2. 价格优化
    print("\n【价格优化建议】")
    price_suggestions = optimizer.optimize_price(listing_data)
    print("当前价格:", f"¥{price_suggestions['current_price']}/晚")
    print("\n价格分析:", price_suggestions['price_analysis'])
    print("\n季节性定价建议:")
    for season, price in price_suggestions['seasonal_pricing'].items():
        print(f"• {season}: {price}")
    
    # 3. 图片优化
    print("\n【图片优化建议】")
    image_suggestions = optimizer.optimize_images(listing_data)
    print("当前图片数量:", image_suggestions['image_count'])
    print("建议图片数量:", image_suggestions['recommended_count'])
    print("\n存在的问题:")
    for issue in image_suggestions['image_issues']:
        print(f"• {issue}")
    print("\n建议添加的图片类型:")
    for img_type in image_suggestions['suggested_image_types']:
        print(f"• {img_type}")
    
    # 4. 描述优化
    print("\n【描述优化建议】")
    description_suggestions = optimizer.optimize_description(listing_data)
    print("当前描述:", description_suggestions['current_description'])
    print("\n存在的问题:")
    for issue in description_suggestions['description_issues']:
        print(f"• {issue}")
    print("\n建议描述框架:")
    print(description_suggestions['description_framework'])

if __name__ == "__main__":
    test_listing_optimization()