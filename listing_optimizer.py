"""
房源优化服务

这个脚本提供了一个全面的房源优化服务，可以为任何房源提供标题、描述、价格和图片的优化建议。
"""

class ListingOptimizer:
    """房源优化服务类"""
    
    def __init__(self):
        """初始化优化器"""
        pass
    
    def optimize_title(self, listing_data):
        """
        优化房源标题
        
        Args:
            listing_data: 房源数据字典
            
        Returns:
            dict: 包含标题优化建议的字典
        """
        # 提取关键信息
        listing_id = listing_data.get('id', 'unknown')
        current_title = listing_data.get('title', '')
        location_type = listing_data.get('locationType', 'APARTMENT')
        num_beds = listing_data.get('numOfBeds', '1')
        
        # 分析当前标题
        title_issues = []
        if len(current_title) < 10:
            title_issues.append("标题过短，缺乏信息量")
        if len(current_title) > 50:
            title_issues.append("标题过长，可能被截断")
        if ' ' not in current_title:
            title_issues.append("缺少空格，可读性差")
        if '|' not in current_title and '-' not in current_title:
            title_issues.append("缺少分隔符，结构不清晰")
        
        # 根据房源类型生成建议标题
        suggested_titles = []
        
        if location_type == 'APARTMENT':
            suggested_titles = [
                f"现代{num_beds}卧公寓 | 舒适便捷 | 全套设施",
                f"精品{num_beds}居室公寓 - 城市美景 - 便利交通",
                f"豪华{num_beds}卧套房 | 市中心地段 | 高端配置"
            ]
        elif location_type == 'HOUSE':
            suggested_titles = [
                f"宽敞{num_beds}卧独栋别墅 | 私家花园 | 家庭首选",
                f"现代风格{num_beds}居室别墅 - 安静社区 - 度假胜地",
                f"豪华{num_beds}卧家庭别墅 | 完美休闲 | 私密空间"
            ]
        elif location_type == 'SPACESHIP':
            suggested_titles = [
                f"未来科技{num_beds}舱太空主题屋 | 独特体验 | 高科技设施",
                f"奢华{num_beds}卧太空舱 - 科幻风格 - 独一无二的住宿",
                f"梦幻{num_beds}居太空主题别墅 | 沉浸式体验 | 科技感十足"
            ]
        else:
            suggested_titles = [
                f"特色{num_beds}卧住宿 | 独特魅力 | 舒适便利",
                f"精选{num_beds}居室 - 完美位置 - 全新装修",
                f"高品质{num_beds}卧套房 | 一流设施 | 超值体验"
            ]
        
        # 返回优化建议
        return {
            'listing_id': listing_id,
            'current_title': current_title,
            'title_issues': title_issues,
            'suggested_titles': suggested_titles,
            'optimization_tips': [
                "使用关键词突出房源主要特点",
                "包含位置或环境优势",
                "提及适合的人群或场景",
                "强调独特卖点",
                "使用分隔符提高可读性",
                "保持简洁，避免过长"
            ]
        }
    
    def optimize_description(self, listing_data):
        """
        优化房源描述
        
        Args:
            listing_data: 房源数据字典
            
        Returns:
            dict: 包含描述优化建议的字典
        """
        # 提取关键信息
        listing_id = listing_data.get('id', 'unknown')
        current_description = listing_data.get('description', '')
        location_type = listing_data.get('locationType', 'APARTMENT')
        num_beds = listing_data.get('numOfBeds', '1')
        
        # 分析当前描述
        description_issues = []
        if len(current_description) < 100:
            description_issues.append("描述过短，信息不足")
        if '\n' not in current_description:
            description_issues.append("缺少段落分隔，可读性差")
        if '设施' not in current_description and '配套' not in current_description:
            description_issues.append("缺少设施信息")
        if '位置' not in current_description and '交通' not in current_description:
            description_issues.append("缺少位置和交通信息")
        
        # 生成描述框架
        description_framework = f"""欢迎来到我们的{self._get_location_type_name(location_type)}！

【房源概况】
这是一处精心设计的{num_beds}卧{self._get_location_type_name(location_type)}，为您提供舒适便捷的住宿体验。[添加房源特色和亮点]

【空间布局】
• {num_beds}间独立卧室，每间配备舒适床铺和优质床品
• 设计精美的客厅，配有舒适沙发和智能电视
• 功能齐全的厨房，配备现代化电器
• 干净整洁的卫生间，提供24小时热水
[根据实际情况补充更多空间信息]

【便利设施】
• 高速WiFi覆盖全屋
• 智能门锁，安全便捷
• 空调/暖气系统
• 洗衣机/烘干机
[根据实际情况补充更多设施信息]

【周边环境】
• 交通便利，距离公共交通站点仅几分钟步行距离
• 周边商超、餐厅一应俱全
• 安静安全的社区环境
[根据实际位置补充更多周边信息]

【适合人群】
• 商务出行的专业人士
• 休闲度假的旅行者
• 短期/长期居住的客人
[根据房源特点补充适合人群]

【入住须知】
• 标准入住时间：下午3点后
• 退房时间：上午11点前
• 最多可住{int(num_beds) * 2}人
• 提供自助入住服务
[根据实际情况补充更多入住规则]

期待您的光临！如有任何问题，随时联系我们。"""
        
        # 返回优化建议
        return {
            'listing_id': listing_id,
            'current_description': current_description,
            'description_issues': description_issues,
            'description_framework': description_framework,
            'optimization_tips': [
                "使用清晰的标题和分段",
                "详细描述房源特色和设施",
                "提供周边环境和交通信息",
                "说明适合的人群",
                "列出入住须知和规则",
                "使用友好和专业的语气",
                "添加个性化的欢迎语"
            ]
        }
    
    def optimize_price(self, listing_data):
        """
        优化房源价格
        
        Args:
            listing_data: 房源数据字典
            
        Returns:
            dict: 包含价格优化建议的字典
        """
        # 提取关键信息
        listing_id = listing_data.get('id', 'unknown')
        current_price = float(listing_data.get('price', '0'))
        location_type = listing_data.get('locationType', 'APARTMENT')
        num_beds = int(listing_data.get('numOfBeds', '1'))
        booking_number = int(listing_data.get('bookingNumber', '0'))
        
        # 基于房源类型和床位数量计算建议价格范围
        base_price = 0
        if location_type == 'APARTMENT':
            base_price = 50 + (num_beds * 20)
        elif location_type == 'HOUSE':
            base_price = 80 + (num_beds * 30)
        elif location_type == 'SPACESHIP':
            base_price = 120 + (num_beds * 40)  # 特殊类型溢价
        else:
            base_price = 60 + (num_beds * 25)
        
        # 价格范围
        min_price = base_price * 0.8
        max_price = base_price * 1.2
        
        # 分析当前价格
        price_analysis = ""
        if current_price < min_price:
            price_analysis = f"当前价格偏低，可能低估了房源价值。建议提高至{min_price:.0f}-{max_price:.0f}元/晚。"
        elif current_price > max_price:
            price_analysis = f"当前价格偏高，可能影响预订率。建议调整至{min_price:.0f}-{max_price:.0f}元/晚。"
        else:
            price_analysis = f"当前价格在合理范围内，但可以根据季节和需求进行动态调整。"
        
        # 季节性定价建议
        seasonal_pricing = {
            "旺季": f"{max_price * 1.2:.0f}元/晚",
            "平季": f"{base_price:.0f}元/晚",
            "淡季": f"{min_price * 0.9:.0f}元/晚",
            "节假日": f"{max_price * 1.3:.0f}元/晚",
            "周末": f"{base_price * 1.1:.0f}元/晚"
        }
        
        # 返回优化建议
        return {
            'listing_id': listing_id,
            'current_price': current_price,
            'suggested_price_range': {
                'min': min_price,
                'base': base_price,
                'max': max_price
            },
            'price_analysis': price_analysis,
            'seasonal_pricing': seasonal_pricing,
            'optimization_tips': [
                "实施动态定价策略，根据季节和需求调整价格",
                "周末和节假日可以提高10-30%的价格",
                "为长期住客提供折扣（如7天以上9折，30天以上8折）",
                "定期分析竞争对手价格，保持竞争力",
                "考虑添加清洁费和额外人员费用，而不是全部包含在基本价格中"
            ]
        }
    
    def optimize_images(self, listing_data):
        """
        优化房源图片
        
        Args:
            listing_data: 房源数据字典
            
        Returns:
            dict: 包含图片优化建议的字典
        """
        # 提取关键信息
        listing_id = listing_data.get('id', 'unknown')
        current_images = listing_data.get('pictures', [])
        location_type = listing_data.get('locationType', 'APARTMENT')
        num_beds = int(listing_data.get('numOfBeds', '1'))
        
        # 分析当前图片
        image_issues = []
        if len(current_images) < 5:
            image_issues.append("图片数量不足，建议至少提供10-15张高质量图片")
        
        for img in current_images:
            if len(img) < 10:
                image_issues.append(f"图片名称'{img}'过短，不利于SEO和管理")
        
        # 建议的图片类型
        suggested_image_types = [
            "房源外观/建筑正面（首图，最具吸引力）",
            "客厅全景（展示空间感和布局）",
        ]
        
        # 根据床位数量添加卧室图片建议
        for i in range(1, num_beds + 1):
            suggested_image_types.append(f"卧室{i}（展示床铺和家具布置）")
        
        suggested_image_types.extend([
            "厨房（展示设备和空间）",
            "卫生间（展示洁净度和设施）",
            "特色设施（如阳台、花园、泳池等）",
            "用餐区域",
            "工作区域（如有）",
            "周边环境/景观",
            "细节特写（如高端设备、艺术品等）"
        ])
        
        # 图片命名建议
        naming_convention = f"{listing_id}_[房间/区域]_[视角]_[编号].jpg"
        naming_examples = [
            f"{listing_id}_exterior_front_01.jpg",
            f"{listing_id}_livingroom_panorama_01.jpg",
            f"{listing_id}_bedroom1_main_01.jpg",
            f"{listing_id}_kitchen_appliances_01.jpg"
        ]
        
        # 返回优化建议
        return {
            'listing_id': listing_id,
            'current_images': current_images,
            'image_count': len(current_images),
            'recommended_count': max(10, 5 + num_beds * 2),
            'image_issues': image_issues,
            'suggested_image_types': suggested_image_types,
            'naming_convention': naming_convention,
            'naming_examples': naming_examples,
            'optimization_tips': [
                "使用专业相机或高端手机拍摄，确保光线充足",
                "拍摄前整理房间，确保干净整洁",
                "使用广角镜头展示空间感",
                "保持一致的风格和色调",
                "按照逻辑顺序排列图片",
                "避免使用过滤器，保持真实感",
                "包含白天和夜晚的照片",
                "展示所有重要空间和设施"
            ]
        }
    
    def _get_location_type_name(self, location_type):
        """
        根据位置类型代码返回中文名称
        
        Args:
            location_type: 位置类型代码
            
        Returns:
            str: 位置类型的中文名称
        """
        type_names = {
            'APARTMENT': '公寓',
            'HOUSE': '别墅',
            'SPACESHIP': '太空舱',
            'VILLA': '豪华别墅',
            'CONDO': '公寓',
            'CABIN': '小木屋',
            'COTTAGE': '度假屋',
            'TENT': '豪华帐篷',
            'CASTLE': '城堡',
            'TREEHOUSE': '树屋'
        }
        return type_names.get(location_type, '住所')