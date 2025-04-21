import { driver as _driver, auth } from 'neo4j-driver';

const driver = _driver('bolt://localhost:7687', auth.basic('neo4j', 'princess'));
const session = driver.session();

async function analyzeReviews(listingId) {
  try {
    const result = await session.run(
      `
      MATCH (r:Review)-[:ABOUT]->(l:Listing {id: $listingId})
      RETURN 
        count(r) AS totalReviews,
        avg(r.rating) AS averageRating,
        sum(size(r.likes)) AS totalLikes,
        sum(size(r.dislikes)) AS totalDislikes,
        collect({
          title: r.title,
          rating: r.rating,
          isFeatured: r.isFeatured,
          isRecommended: r.isRecommended
        }) AS reviews
      `,
      { listingId }
    );

    const stats = result.records[0].toObject();
    console.log("🔍 Review Summary for Listing", listingId);
    console.log("Total Reviews:", stats.totalReviews.low);
    console.log("Average Rating:", stats.averageRating);
    console.log("Total Likes:", stats.totalLikes.low);
    console.log("Total Dislikes:", stats.totalDislikes.low);
    console.log("Reviews:");
    stats.reviews.forEach((rev, i) => {
      console.log(`  ${i + 1}. ${rev.title} — ⭐️ ${rev.rating}`);
    });

  } catch (err) {
    console.error("Error analyzing reviews:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

analyzeReviews("60d21b4667d0d8992e610c85");
