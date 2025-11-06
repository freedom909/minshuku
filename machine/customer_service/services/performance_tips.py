from typing import Optional, List

def get_performance_tips(listingId: Optional[str] = None) -> List[str]:
    """
    Get performance optimization tips for a listing.

    Parameters:
    - listingId: The ID of the listing to analyze. If not provided, general tips will be returned.

    Returns:
    - A list of performance optimization tips.
    """
    if listingId:
        # 根据 listingId 查询或生成具体的性能优化建议
        return [
            f"Optimize images for listing {listingId} to reduce load time.",
            f"Enable caching for listing {listingId} to improve performance.",
            f"Use lazy loading for listing {listingId} to enhance user experience."
        ]
    else:
        # 返回通用的性能优化建议
        return [
            "Optimize all images to reduce load time.",
            "Enable caching for frequently accessed data.",
            "Use lazy loading for images and videos.",
            "Minify CSS and JavaScript files.",
            "Reduce server response time by optimizing database queries."
        ]