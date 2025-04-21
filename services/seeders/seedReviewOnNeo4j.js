import neo4j from "neo4j-driver";

// Neo4j driver setup
const driver = neo4j.driver(
  "bolt://localhost:7687",
  neo4j.auth.basic("neo4j", "princess") // replace with your Neo4j password
);

const session = driver.session();

const reviews = [
  {
    title: "Amazing Stay!",
    rating: 5.0,
    content: "I had a wonderful experience at this location. The host was very welcoming and the amenities were top-notch.",
    picture: "https://example.com/image1.jpg",
    comments: [],
    likes: ["60d21b4667d0d8992e610c87"],
    dislikes: [],
    isFeatured: true,
    isRecommended: false,
    isPinned: false,
    round: 1.0,
    createdAt: "2025-04-15T06:51:03.350Z",
    updatedAt: "2025-04-15T06:51:03.351Z",
    authorId: "60d21b4667d0d8992e610c88",
    guestId: "60d21b4667d0d8992e610c87",
    hostId: "60d21b4667d0d8992e610c86",
    locationId: "60d21b4667d0d8992e610c85",
    bookingId: "60d21b4667d0d8992e610c89"
  },
  {
    title: "Not as expected",
    rating: 2.0,
    content: "The place was not clean, and the host was unresponsive. Very disappointed.",
    picture: "https://example.com/image2.jpg",
    comments: [],
    likes: [],
    dislikes: ["60d21b4667d0d8992e610c88"],
    isFeatured: false,
    isRecommended: true,
    isPinned: false,
    round: 1.0,
    createdAt: "2025-04-15T06:51:03.531Z",
    updatedAt: "2025-04-15T06:51:03.531Z",
    authorId: "60d21b4667d0d8992e610c88",
    guestId: "60d21b4667d0d8992e610c87",
    hostId: "60d21b4667d0d8992e610c86",
    locationId: "60d21b4667d0d8992e610c85",
    bookingId: "60d21b4667d0d8992e610c89"
  },
  {
    title: "Good value for money",
    rating: 4.0,
    content: "The location is great and the price is very reasonable. Would recommend to others!",
    picture: "https://example.com/image3.jpg",
    comments: [],
    likes: ["60d21b4667d0d8992e610c87"],
    dislikes: [],
    isFeatured: false,
    isRecommended: false,
    isPinned: true,
    round: 1.0,
    createdAt: "2025-04-15T06:51:03.576Z",
    updatedAt: "2025-04-15T06:51:03.576Z",
    authorId: "60d21b4667d0d8992e610c88",
    guestId: "60d21b4667d0d8992e610c87",
    hostId: "60d21b4667d0d8992e610c86",
    locationId: "60d21b4667d0d8992e610c85",
    bookingId: "60d21b4667d0d8992e610c89"
  }
];

async function seed() {
  try {
    // Step 1: Create mock users, listing, and booking
    await session.run(
      `
      MERGE (:User {id: "60d21b4667d0d8992e610c88"}) // author
      MERGE (:User {id: "60d21b4667d0d8992e610c87"}) // guest
      MERGE (:User {id: "60d21b4667d0d8992e610c86"}) // host
      MERGE (:Listing {id: "60d21b4667d0d8992e610c85"})
      MERGE (:Booking {id: "60d21b4667d0d8992e610c89"})
      `
    );

    // Step 2: Insert reviews and relationships
    for (const review of reviews) {
      await session.run(
        `
        CREATE (r:Review {
          title: $title,
          rating: $rating,
          content: $content,
          picture: $picture,
          comments: $comments,
          likes: $likes,
          dislikes: $dislikes,
          isFeatured: $isFeatured,
          isRecommended: $isRecommended,
          isPinned: $isPinned,
          round: $round,
          createdAt: datetime($createdAt),
          updatedAt: datetime($updatedAt)
        })
        WITH r
        MATCH (author:User {id: $authorId})
        MATCH (guest:User {id: $guestId})
        MATCH (host:User {id: $hostId})
        MATCH (listing:Listing {id: $locationId})
        MATCH (booking:Booking {id: $bookingId})
        MERGE (author)-[:WROTE]->(r)
        MERGE (guest)-[:GUEST_REVIEWED]->(r)
        MERGE (host)-[:HOST_REVIEWED]->(r)
        MERGE (r)-[:ABOUT]->(listing)
        MERGE (r)-[:BOOKED]->(booking)
        `,
        review
      );
    }

    console.log("✅ Seeding complete!");
  } catch (err) {
    console.error("❌ Error during seeding:", err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
