import { MongoMemoryServer } from 'mongodb-memory-server';

async function startMongo() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017
    }
  });

  console.log(`\n================================`);
  console.log(`✅ MongoDB Memory Server Started V2`);
  console.log(`📍 URI: ${mongod.getUri()}`);
  console.log(`================================\n`);
  
  // Keep process alive
  process.stdin.resume();
}

startMongo().catch(err => {
  console.error('Failed to start MongoMemoryServer', err);
});
