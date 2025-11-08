# customer_service/demo/chatbot_demo.py
"""Demo script for testing the chatbot functionality"""

import asyncio
import json
from machine.customer_service.services.chatbot import chatbot_instance

async def demo_chatbot():
    """Demo the chatbot with various query types"""
    
    print("🤖 Minshuku Chatbot Demo")
    print("=" * 50)
    
    # Test queries for different categories
    test_queries = [
        ("Hello, I need help with booking a room", "General greeting"),
        ("What listings are available in Tokyo this weekend?", "Listing availability"),
        ("How much does it cost to book for 3 nights?", "Pricing question"),
        ("I'm having trouble logging into my account", "Technical support"),
        ("Can I get a refund if I cancel my booking?", "Payment/refund question"),
        ("How do I write a review for my stay?", "Review-related question"),
        ("What amenities does the property have?", "Property details")
    ]
    
    for query, description in test_queries:
        print(f"\n📝 Query: {query}")
        print(f"📋 Description: {description}")
        print("-" * 30)
        
        try:
            # Classify the query first
            query_type = await chatbot_instance.classify_query(query)
            print(f"🔍 Classification: {query_type}")
            
            # Process the full query
            result = await chatbot_instance.process_query(query, user_id="demo-user")
            
            if "error" in result:
                print(f"❌ Error: {result['error']}")
            else:
                print(f"🤖 Response: {result['response']}")
                print(f"📊 Query Type: {result['query_classification']}")
                print(f"🕒 Timestamp: {result['timestamp']}")
                
                if result.get('suggested_actions'):
                    print(f"💡 Suggested Actions: {', '.join(result['suggested_actions'])}")
        
        except Exception as e:
            print(f"💥 Error processing query: {e}")
        
        print("-" * 30)
        await asyncio.sleep(1)  # Small delay between queries
    
    # Test conversation history
    print("\n📚 Conversation History Demo")
    print("-" * 30)
    
    history = await chatbot_instance.get_conversation_history("demo-user")
    print(f"Total conversations: {len(history)}")
    
    for i, conv in enumerate(history, 1):
        print(f"\nConversation {i}:")
        print(f"  Query: {conv['query']}")
        print(f"  Response: {conv['response'][:100]}...")
        print(f"  Time: {conv['timestamp']}")
    
    # Test batch processing
    print("\n🔄 Batch Processing Demo")
    print("-" * 30)
    
    batch_queries = [
        {"message": "Hello, I need help", "user_id": "batch-user-1"},
        {"message": "What's the cancellation policy?", "user_id": "batch-user-2"},
        {"message": "How do I contact the host?", "user_id": "batch-user-3"}
    ]
    
    for query_data in batch_queries:
        result = await chatbot_instance.process_query(
            query=query_data["message"],
            user_id=query_data["user_id"]
        )
        print(f"User: {query_data['user_id']}")
        print(f"Query: {query_data['message']}")
        print(f"Response: {result['response'][:80]}...")
        print()
    
    # Health check
    print("\n🏥 Health Check")
    print("-" * 30)
    
    try:
        test_query = "Hello, I need help with booking"
        query_type = await chatbot_instance.classify_query(test_query)
        
        print(f"✅ Classification working: {query_type}")
        print(f"✅ Active conversations: {len(chatbot_instance.conversation_history)}")
        print("✅ Chatbot service is healthy!")
        
    except Exception as e:
        print(f"❌ Health check failed: {e}")

async def demo_listing_info():
    """Demo listing information retrieval"""
    
    print("\n🏠 Listing Information Demo")
    print("=" * 50)
    
    # Test with a sample listing ID (you might need to adjust this)
    test_listing_ids = ["listing-001", "listing-002"]
    
    for listing_id in test_listing_ids:
        print(f"\n🔍 Getting info for listing: {listing_id}")
        
        try:
            listing_info = await chatbot_instance.get_listing_info(listing_id)
            
            if "error" in listing_info:
                print(f"❌ Error: {listing_info['error']}")
            else:
                print(f"✅ Found listing: {listing_info.get('title', 'Unknown')}")
                print(f"   Description: {listing_info.get('description', 'No description')[:100]}...")
                print(f"   Total fields: {len(listing_info)}")
                
        except Exception as e:
            print(f"💥 Error getting listing info: {e}")

if __name__ == "__main__":
    print("Starting Minshuku Chatbot Demo...")
    
    # Run demos
    asyncio.run(demo_chatbot())
    asyncio.run(demo_listing_info())
    
    print("\n🎉 Demo completed successfully!")
    print("\nTo use the chatbot in your application:")
    print("1. Import the chatbot service")
    print("2. Use the process_query() method for user interactions")
    print("3. Access via API endpoints at /api/chatbot/*")