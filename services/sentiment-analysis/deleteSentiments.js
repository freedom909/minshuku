import connectToMongoDB from "../DB/connectMongoDB.js";

const deleteSentiments = async () => {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection("sentiments");

        // Find 3 oldest records to delete
        const oldestThree = await collection
            .find({})
            .sort({ createdAt: 1 }) // oldest first
            .limit(3)
            .toArray();

        const idsToDelete = oldestThree.map(doc => doc._id);

        const result = await collection.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`🗑️ Deleted ${result.deletedCount} sentiment record(s).`);
    } catch (err) {
        console.error("❌ Error deleting records:", err);
    }
};

deleteSentiments();
