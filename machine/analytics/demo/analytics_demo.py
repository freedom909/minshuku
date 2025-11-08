#!/usr/bin/env python3
"""
Analytics System Demo Script

Demonstrates all the advanced features of the analytics system.
"""

import asyncio
import requests
import json
from datetime import datetime, timedelta

# Base URL for the analytics API
BASE_URL = "http://localhost:8000/analytics/report"


class AnalyticsDemo:
    """Demo class for showcasing analytics system features"""
    
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
    
    def make_request(self, endpoint, method="GET", data=None):
        """Make HTTP request to analytics API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, params=data if data else {})
            elif method == "POST":
                response = requests.post(url, json=data)
            else:
                return {"error": f"Unsupported method: {method}"}
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"HTTP {response.status_code}: {response.text}"}
                
        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {e}"}
    
    async def demo_basic_reports(self):
        """Demo basic report generation"""
        print("\n📊 1. Basic Report Generation")
        print("=" * 50)
        
        # Generate listing report
        result = self.make_request("/generate", data={
            "report_type": "listing"
        })
        
        if "error" not in result:
            print("✅ Listing report generated successfully")
            summary = result.get("data", {}).get("summary", {})
            print(f"   Total listings: {summary.get('total_listings', 0)}")
            print(f"   Average performance: {summary.get('avg_performance', 0)}")
        else:
            print(f"❌ Error: {result['error']}")
        
        # Generate revenue report
        result = self.make_request("/generate", data={
            "report_type": "revenue"
        })
        
        if "error" not in result:
            print("✅ Revenue report generated successfully")
            stats = result.get("data", {}).get("revenue_stats", {})
            print(f"   Total potential revenue: ${stats.get('total_potential_revenue', 0)}")
        else:
            print(f"❌ Error: {result['error']}")
    
    async def demo_advanced_filtering(self):
        """Demo advanced filtering capabilities"""
        print("\n🔍 2. Advanced Filtering")
        print("=" * 50)
        
        # Filter by price range
        result = self.make_request("/filter", data={
            "min_price": 50,
            "max_price": 200
        })
        
        if "error" not in result:
            print("✅ Price filtering applied successfully")
            results = result.get("results", {})
            print(f"   Matches found: {results.get('total_matches', 0)}")
            
            # Show filtered listings
            listings = results.get("listings", [])
            for listing in listings[:3]:  # Show first 3
                title = listing.get("title", "Unknown")
                price = listing.get("price", 0)
                performance = listing.get("performance_metrics", {}).get("overall_performance", 0)
                print(f"   - {title}: ${price} (Score: {performance})")
        else:
            print(f"❌ Error: {result['error']}")
        
        # Filter by rating
        result = self.make_request("/filter", data={
            "min_rating": 4.0
        })
        
        if "error" not in result:
            print("\n✅ Rating filtering applied successfully")
            results = result.get("results", {})
            print(f"   High-rated listings: {results.get('total_matches', 0)}")
        else:
            print(f"❌ Error: {result['error']}")
    
    async def demo_batch_processing(self):
        """Demo batch report generation"""
        print("\n⚡ 3. Batch Processing")
        print("=" * 50)
        
        # Create batch requests
        batch_requests = [
            {"report_type": "listing", "listing_id": "listing-001"},
            {"report_type": "listing", "listing_id": "listing-002"},
            {"report_type": "revenue"},
            {"report_type": "listing", "date_from": "2023-01-01", "date_to": "2023-12-31"}
        ]
        
        result = self.make_request("/batch", method="POST", data=batch_requests)
        
        if "error" not in result:
            print("✅ Batch processing completed successfully")
            batch_results = result.get("results", {})
            print(f"   Total requests: {batch_results.get('total_requests', 0)}")
            print(f"   Successful: {batch_results.get('successful_reports', 0)}")
            print(f"   Failed: {batch_results.get('failed_reports', 0)}")
            print(f"   Processing time: {batch_results.get('processing_time', 0):.2f}s")
            
            summary = batch_results.get("summary", {})
            print(f"   Success rate: {summary.get('success_rate', 0)}%")
        else:
            print(f"❌ Error: {result['error']}")
    
    async def demo_comparative_analysis(self):
        """Demo comparative analysis"""
        print("\n📈 4. Comparative Analysis")
        print("=" * 50)
        
        # Compare multiple listings
        listing_ids = "listing-001,listing-002,listing-003"
        result = self.make_request("/compare", data={"listing_ids": listing_ids})
        
        if "error" not in result:
            print("✅ Comparative analysis completed successfully")
            analysis = result.get("analysis", {})
            
            # Show ranking
            ranking = analysis.get("ranking", [])
            print("\n🏆 Performance Ranking:")
            for item in ranking:
                print(f"   #{item.get('rank', 0)}: {item.get('title', 'Unknown')} "
                      f"(Score: {item.get('performance_score', 0)})")
            
            # Show metrics
            metrics = analysis.get("comparison_metrics", {})
            avg_metrics = metrics.get("average_metrics", {})
            print(f"\n📊 Average Metrics:")
            print(f"   Performance: {avg_metrics.get('avg_performance', 0)}")
            print(f"   Price: ${avg_metrics.get('avg_price', 0)}")
            print(f"   Rating: {avg_metrics.get('avg_rating', 0)}")
            
            # Show insights
            insights = analysis.get("insights", [])
            if insights:
                print(f"\n💡 Insights:")
                for insight in insights:
                    print(f"   - {insight}")
        else:
            print(f"❌ Error: {result['error']}")
    
    async def demo_predictive_analytics(self):
        """Demo predictive analytics"""
        print("\n🔮 5. Predictive Analytics")
        print("=" * 50)
        
        # Generate predictions
        result = self.make_request("/predictive", data={
            "listing_id": "listing-001",
            "forecast_period": 7
        })
        
        if "error" not in result:
            print("✅ Predictive analysis completed successfully")
            prediction = result.get("prediction", {})
            
            print(f"📈 Performance Trend: {prediction.get('performance_trend', 'unknown')}")
            print(f"💰 Revenue Growth: {prediction.get('potential_revenue_growth', '0%')}")
            print(f"🎯 Confidence: {prediction.get('confidence_level', 'medium')}")
            
            opportunities = prediction.get("optimization_opportunities", [])
            if opportunities:
                print(f"\n💡 Optimization Opportunities:")
                for opp in opportunities:
                    print(f"   - {opp}")
        else:
            print(f"❌ Error: {result['error']}")
    
    async def demo_monitoring(self):
        """Demo system monitoring"""
        print("\n📊 6. System Monitoring")
        print("=" * 50)
        
        # Health check
        result = self.make_request("/health")
        
        if "error" not in result:
            print("✅ Health check completed")
            print(f"   System Status: {result.get('status', 'unknown')}")
            
            services = result.get("services", {})
            print("   Database Status:")
            for service, status in services.items():
                print(f"     - {service}: {status}")
            
            cache = result.get("cache", {})
            print(f"   Cache: {cache.get('cached_reports', 0)} active reports")
        else:
            print(f"❌ Error: {result['error']}")
        
        # Real-time monitoring
        result = self.make_request("/monitor")
        
        if "error" not in result:
            print("\n✅ Real-time monitoring active")
            metrics = result.get("metrics", {})
            print(f"   Total Listings: {metrics.get('total_listings', 0)}")
            
            performance = result.get("performance", {})
            cache_perf = performance.get("cache", {})
            print(f"   Cache Hit Ratio: {cache_perf.get('cache_hit_ratio', '0%')}")
        else:
            print(f"❌ Error: {result['error']}")
    
    async def demo_data_export(self):
        """Demo data export functionality"""
        print("\n💾 7. Data Export")
        print("=" * 50)
        
        # Export analytics data
        result = self.make_request("/export/data", data={"format": "json"})
        
        if "error" not in result:
            print("✅ Data export completed successfully")
            export_data = result.get("export", {})
            
            print(f"   Export Timestamp: {export_data.get('export_timestamp', 'unknown')}")
            print(f"   Format: {export_data.get('format', 'unknown')}")
            
            reports = export_data.get("reports", {})
            print(f"   Reports Exported: {len(reports)}")
            
            cache_stats = export_data.get("cache_stats", {})
            print(f"   Cache Entries: {cache_stats.get('total_entries', 0)}")
        else:
            print(f"❌ Error: {result['error']}")
    
    async def demo_dashboard(self):
        """Demo analytics dashboard"""
        print("\n🎯 8. Analytics Dashboard")
        print("=" * 50)
        
        result = self.make_request("/dashboard")
        
        if "error" not in result:
            print("✅ Dashboard generated successfully")
            dashboard = result.get("dashboard", {})
            
            overview = dashboard.get("overview", {})
            print("📊 Overview:")
            print(f"   Total Listings: {overview.get('total_listings', 0)}")
            print(f"   Avg Performance: {overview.get('avg_performance', 0)}")
            print(f"   Potential Revenue: ${overview.get('total_potential_revenue', 0)}")
            
            metrics = dashboard.get("performance_metrics", {})
            print(f"\n⚡ Performance:")
            print(f"   Cache Efficiency: {metrics.get('cache_efficiency', 0)} entries")
            print(f"   Generation Speed: {metrics.get('report_generation_speed', 'unknown')}")
            
            quick_actions = dashboard.get("quick_actions", [])
            print(f"\n🚀 Quick Actions Available: {len(quick_actions)}")
        else:
            print(f"❌ Error: {result['error']}")
    
    async def run_complete_demo(self):
        """Run complete demo of all features"""
        print("🚀 Starting Analytics System Demo")
        print("=" * 60)
        
        # Check if service is available
        print("🔍 Checking service availability...")
        health_result = self.make_request("/health")
        
        if "error" in health_result:
            print("❌ Analytics service is not available")
            print("   Please make sure the service is running on localhost:8000")
            print("   You can start it with: uvicorn machine.main:app --reload")
            return
        
        print("✅ Service is available! Starting demo...")
        
        # Run all demos
        await self.demo_basic_reports()
        await self.demo_advanced_filtering()
        await self.demo_batch_processing()
        await self.demo_comparative_analysis()
        await self.demo_predictive_analytics()
        await self.demo_monitoring()
        await self.demo_data_export()
        await self.demo_dashboard()
        
        print("\n" + "=" * 60)
        print("🎉 Analytics System Demo Completed Successfully!")
        print("\n📋 Summary of Features Demonstrated:")
        print("   1. 📊 Basic Report Generation")
        print("   2. 🔍 Advanced Filtering")
        print("   3. ⚡ Batch Processing")
        print("   4. 📈 Comparative Analysis")
        print("   5. 🔮 Predictive Analytics")
        print("   6. 📊 System Monitoring")
        print("   7. 💾 Data Export")
        print("   8. 🎯 Analytics Dashboard")
        print("\n💡 Next Steps:")
        print("   - Explore the API documentation")
        print("   - Integrate with your frontend application")
        print("   - Customize reports for your specific needs")


async def main():
    """Main demo function"""
    demo = AnalyticsDemo()
    await demo.run_complete_demo()


if __name__ == "__main__":
    # Run the demo
    asyncio.run(main())