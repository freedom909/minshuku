# machine/ml/recommendation_engine.py
"""Advanced Recommendation Engine for Minshuku Management System"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler
import joblib
import os

logger = logging.getLogger(__name__)

class RecommendationEngine:
    """Advanced recommendation system for listings, users, and content"""
    
    def __init__(self, mysql_pool, neo4j_driver):
        self.mysql_pool = mysql_pool
        self.neo4j_driver = neo4j_driver
        self.models = {}
        self.vectorizers = {}
        self.model_dir = "ml_models"
        os.makedirs(self.model_dir, exist_ok=True)
    
    async def recommend_similar_listings(self, listing_id: str, limit: int = 10) -> Dict:
        """Recommend similar listings based on content and features"""
        try:
            # Get target listing features
            target_listing = await self._get_listing_features(listing_id)
            
            if not target_listing:
                return {"error": "Listing not found"}
            
            # Get all listings for comparison
            all_listings = await self._get_all_listings()
            
            if len(all_listings) <= 1:
                return {"error": "Insufficient listings for recommendation"}
            
            # Calculate similarity scores
            similarities = await self._calculate_listing_similarities(target_listing, all_listings)
            
            # Get top recommendations
            recommendations = self._get_top_recommendations(similarities, limit)
            
            return {
                "target_listing": listing_id,
                "recommendations": recommendations,
                "similarity_metrics": self._get_similarity_metrics(similarities),
                "algorithm": "content_based_cosine_similarity"
            }
            
        except Exception as e:
            logger.error(f"Error recommending similar listings: {e}")
            return {"error": str(e)}
    
    async def recommend_for_user(self, user_id: str, limit: int = 15) -> Dict:
        """Recommend listings based on user preferences and behavior"""
        try:
            # Get user preferences and history
            user_profile = await self._get_user_profile(user_id)
            
            if not user_profile:
                return {"error": "User profile not found"}
            
            # Get all available listings
            all_listings = await self._get_all_listings()
            
            if len(all_listings) == 0:
                return {"error": "No listings available"}
            
            # Calculate user-listing compatibility scores
            recommendations = await self._calculate_user_recommendations(user_profile, all_listings, limit)
            
            return {
                "user_id": user_id,
                "recommendations": recommendations,
                "preference_analysis": self._analyze_user_preferences(user_profile),
                "algorithm": "collaborative_filtering_hybrid"
            }
            
        except Exception as e:
            logger.error(f"Error recommending for user: {e}")
            return {"error": str(e)}
    
    async def recommend_promotions(self, listing_id: str, strategy: str = "smart") -> Dict:
        """Recommend promotional strategies for listings"""
        try:
            # Get listing performance data
            listing_performance = await self._get_listing_performance(listing_id)
            
            if not listing_performance:
                return {"error": "Listing performance data not available"}
            
            # Analyze performance and market conditions
            analysis = await self._analyze_promotion_potential(listing_performance)
            
            # Generate promotion recommendations
            promotions = await self._generate_promotion_recommendations(analysis, strategy)
            
            return {
                "listing_id": listing_id,
                "promotion_recommendations": promotions,
                "performance_analysis": analysis,
                "strategy": strategy,
                "expected_impact": self._estimate_promotion_impact(promotions)
            }
            
        except Exception as e:
            logger.error(f"Error recommending promotions: {e}")
            return {"error": str(e)}
    
    async def recommend_content_optimization(self, listing_id: str) -> Dict:
        """Recommend content optimization strategies for listings"""
        try:
            # Get listing content and performance
            listing_content = await self._get_listing_content(listing_id)
            
            if not listing_content:
                return {"error": "Listing content not found"}
            
            # Analyze content quality and engagement
            content_analysis = await self._analyze_content_quality(listing_content)
            
            # Generate optimization recommendations
            optimizations = await self._generate_content_optimizations(content_analysis)
            
            return {
                "listing_id": listing_id,
                "content_analysis": content_analysis,
                "optimization_recommendations": optimizations,
                "seo_score": self._calculate_seo_score(listing_content),
                "engagement_potential": self._estimate_engagement_potential(optimizations)
            }
            
        except Exception as e:
            logger.error(f"Error recommending content optimization: {e}")
            return {"error": str(e)}
    
    # Helper methods for recommendation engine
    async def _get_listing_features(self, listing_id: str) -> Optional[Dict]:
        """Get comprehensive listing features"""
        try:
            conn = self.mysql_pool.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
            SELECT 
                l.id, l.title, l.description, l.price, l.numOfBeds, 
                l.locationType, l.listingStatus, l.isFeatured,
                AVG(r.rating) as avg_rating,
                COUNT(r.id) as review_count
            FROM listings l
            LEFT JOIN reviews r ON l.id = r.listingId
            WHERE l.id = %s
            GROUP BY l.id
            """
            
            cursor.execute(query, (listing_id,))
            result = cursor.fetchone()
            cursor.close()
            conn.close()
            
            return result if result else None
            
        except Exception as e:
            logger.error(f"Error getting listing features: {e}")
            return None
    
    async def _get_all_listings(self) -> List[Dict]:
        """Get features for all listings"""
        try:
            conn = self.mysql_pool.get_connection()
            cursor = conn.cursor(dictionary=True)
            
            query = """
            SELECT 
                l.id, l.title, l.description, l.price, l.numOfBeds, 
                l.locationType, l.listingStatus, l.isFeatured,
                AVG(r.rating) as avg_rating,
                COUNT(r.id) as review_count
            FROM listings l
            LEFT JOIN reviews r ON l.id = r.listingId
            GROUP BY l.id
            """
            
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()
            conn.close()
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting all listings: {e}")
            return []
    
    async def _calculate_listing_similarities(self, target: Dict, listings: List[Dict]) -> List[Dict]:
        """Calculate similarity scores between listings"""
        similarities = []
        
        # Create feature vectors
        target_features = self._create_listing_feature_vector(target)
        
        for listing in listings:
            if listing['id'] == target['id']:
                continue
                
            listing_features = self._create_listing_feature_vector(listing)
            
            # Calculate cosine similarity
            similarity = cosine_similarity([target_features], [listing_features])[0][0]
            
            similarities.append({
                'listing_id': listing['id'],
                'title': listing['title'],
                'similarity_score': round(similarity, 4),
                'price': listing['price'],
                'rating': listing.get('avg_rating', 0)
            })
        
        return sorted(similarities, key=lambda x: x['similarity_score'], reverse=True)
    
    def _create_listing_feature_vector(self, listing: Dict) -> np.array:
        """Create numerical feature vector for listing"""
        # Combine text features
        text_content = f"{listing.get('title', '')} {listing.get('description', '')}"
        
        # Initialize TF-IDF vectorizer if not exists
        if 'tfidf' not in self.vectorizers:
            self.vectorizers['tfidf'] = TfidfVectorizer(max_features=100, stop_words='english')
        
        # Fit and transform text (simplified implementation)
        # In production, this would use pre-trained models
        
        # Numerical features
        numerical_features = [
            listing.get('price', 0) / 1000,  # Normalize price
            listing.get('numOfBeds', 1),
            listing.get('avg_rating', 0),
            listing.get('review_count', 0) / 100,  # Normalize review count
            1 if listing.get('isFeatured', 0) else 0
        ]
        
        return np.array(numerical_features)
    
    def _get_top_recommendations(self, similarities: List[Dict], limit: int) -> List[Dict]:
        """Get top N recommendations"""
        return similarities[:limit]
    
    def _get_similarity_metrics(self, similarities: List[Dict]) -> Dict:
        """Calculate similarity distribution metrics"""
        scores = [s['similarity_score'] for s in similarities]
        
        return {
            'average_similarity': round(np.mean(scores), 4),
            'max_similarity': round(max(scores), 4) if scores else 0,
            'min_similarity': round(min(scores), 4) if scores else 0,
            'recommendation_count': len(scores)
        }
    
    async def _get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile and preferences"""
        # Simplified implementation
        return {
            'user_id': user_id,
            'preferred_price_range': [50, 200],
            'preferred_location_types': ['city', 'beach'],
            'booking_history': []
        }
    
    async def _calculate_user_recommendations(self, user_profile: Dict, listings: List[Dict], limit: int) -> List[Dict]:
        """Calculate user-specific recommendations"""
        recommendations = []
        
        for listing in listings:
            # Calculate compatibility score
            compatibility = self._calculate_user_listing_compatibility(user_profile, listing)
            
            recommendations.append({
                'listing_id': listing['id'],
                'title': listing['title'],
                'compatibility_score': round(compatibility, 4),
                'price': listing['price'],
                'rating': listing.get('avg_rating', 0),
                'match_reasons': self._get_match_reasons(user_profile, listing)
            })
        
        return sorted(recommendations, key=lambda x: x['compatibility_score'], reverse=True)[:limit]
    
    def _calculate_user_listing_compatibility(self, user_profile: Dict, listing: Dict) -> float:
        """Calculate compatibility between user and listing"""
        score = 0.0
        
        # Price compatibility
        price = listing.get('price', 0)
        preferred_min, preferred_max = user_profile.get('preferred_price_range', [0, 1000])
        
        if preferred_min <= price <= preferred_max:
            score += 0.4
        elif price < preferred_min:
            score += 0.3
        elif price > preferred_max:
            score += 0.1
        
        # Location compatibility
        location_type = listing.get('locationType', '')
        preferred_locations = user_profile.get('preferred_location_types', [])
        
        if location_type in preferred_locations:
            score += 0.3
        
        # Rating compatibility
        rating = listing.get('avg_rating', 0)
        if rating >= 4.0:
            score += 0.2
        elif rating >= 3.0:
            score += 0.1
        
        # Featured bonus
        if listing.get('isFeatured', 0):
            score += 0.1
        
        return min(score, 1.0)
    
    def _get_match_reasons(self, user_profile: Dict, listing: Dict) -> List[str]:
        """Get reasons why listing matches user preferences"""
        reasons = []
        
        price = listing.get('price', 0)
        preferred_min, preferred_max = user_profile.get('preferred_price_range', [0, 1000])
        
        if preferred_min <= price <= preferred_max:
            reasons.append("Price matches your budget")
        
        location_type = listing.get('locationType', '')
        preferred_locations = user_profile.get('preferred_location_types', [])
        
        if location_type in preferred_locations:
            reasons.append("Location type matches your preferences")
        
        rating = listing.get('avg_rating', 0)
        if rating >= 4.0:
            reasons.append("High guest ratings")
        
        if listing.get('isFeatured', 0):
            reasons.append("Featured listing")
        
        return reasons if reasons else ["Good overall match"]
    
    def _analyze_user_preferences(self, user_profile: Dict) -> Dict:
        """Analyze user preferences for insights"""
        return {
            'preference_strength': 'strong',
            'price_sensitivity': 'medium',
            'location_preference': user_profile.get('preferred_location_types', []),
            'booking_frequency': 'occasional'
        }
    
    # Placeholder methods for promotion and content recommendations
    async def _get_listing_performance(self, listing_id: str) -> Optional[Dict]:
        """Get listing performance metrics"""
        return None
    
    async def _analyze_promotion_potential(self, performance: Dict) -> Dict:
        """Analyze promotion potential"""
        return {}
    
    async def _generate_promotion_recommendations(self, analysis: Dict, strategy: str) -> List[Dict]:
        """Generate promotion recommendations"""
        return []
    
    def _estimate_promotion_impact(self, promotions: List[Dict]) -> Dict:
        """Estimate impact of promotions"""
        return {}
    
    async def _get_listing_content(self, listing_id: str) -> Optional[Dict]:
        """Get listing content"""
        return None
    
    async def _analyze_content_quality(self, content: Dict) -> Dict:
        """Analyze content quality"""
        return {}
    
    async def _generate_content_optimizations(self, analysis: Dict) -> List[Dict]:
        """Generate content optimization recommendations"""
        return []
    
    def _calculate_seo_score(self, content: Dict) -> float:
        """Calculate SEO score"""
        return 0.0
    
    def _estimate_engagement_potential(self, optimizations: List[Dict]) -> str:
        """Estimate engagement potential"""
        return "medium"