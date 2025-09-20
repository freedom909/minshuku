import neo4j from "neo4j-driver";

// Connection details
const uri = "neo4j+s://2c7eebe4.databases.neo4j.io";
const username = "neo4j";
const password = "princess";
const database = "neo4j"; // Default database name

async function testConnection() {
  console.log("Testing Neo4j connection with alternative methods");
  console.log(`URI: ${uri}`);
  console.log(`Username: ${username}`);
  console.log(`Database: ${database}`);
  
  // Try different connection configurations
  const configs = [
    {
      name: "Basic auth with default options",
      auth: neo4j.auth.basic(username, password),
      options: { database }
    },
    {
      name: "Basic auth with encryption ENCRYPTION_ON",
      auth: neo4j.auth.basic(username, password),
      options: { 
        encrypted: "ENCRYPTION_ON",
        database
      }
    },
    {
      name: "Basic auth with trust strategy",
      auth: neo4j.auth.basic(username, password),
      options: {
        encrypted: true,
        trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES",
        database
      }
    },
    {
      name: "Basic auth with connection timeout",
      auth: neo4j.auth.basic(username, password),
      options: {
        connectionTimeout: 30000, // 30 seconds
        database
      }
    }
  ];
  
  for (const config of configs) {
    console.log(`\n\nTrying: ${config.name}`);
    
    let driver = null;
    let session = null;
    
    try {
      // Create driver
      driver = neo4j.driver(uri, config.auth, config.options);
      console.log("Driver created successfully");
      
      // Verify connectivity
      await driver.verifyConnectivity();
      console.log("✅ Connectivity verified successfully");
      
      // Create session and run query
      session = driver.session({ database });
      console.log("✅ Session created successfully");
      
      const result = await session.run("RETURN 'Connection successful' AS message");
      console.log(`✅ Query result: ${result.records[0].get("message")}`);
      
      // If we get here, connection was successful
      console.log("\n✅ CONNECTION SUCCESSFUL with configuration:");
      console.log(JSON.stringify(config, null, 2));
      break;
      
    } catch (error) {
      console.error(`❌ Error with ${config.name}: ${error.message}`);
      if (error.code) {
        console.error(`Error code: ${error.code}`);
      }
    } finally {
      if (session) await session.close();
      if (driver) await driver.close();
    }
  }
}

// Run the test
testConnection();