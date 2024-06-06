module.exports = {
    async up(db, client) {
      console.log("Running migration: Add field 'status' to users");
      await db.collection('users').updateMany({}, { $set: { status: 'active' } });
    },
    async down(db, client) {
      console.log("Reverting migration: Remove field 'status' from users");
      await db.collection('users').updateMany({}, { $unset: { status: '' } });
    },
  };
  
  