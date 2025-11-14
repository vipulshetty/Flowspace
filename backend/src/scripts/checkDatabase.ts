import mongoose from 'mongoose';
import { Realm } from '../db/models/Realm';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowspace';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Connection string:', MONGODB_URI.substring(0, 30) + '...');

    const realms = await Realm.find({});
    console.log(`\nTotal realms found: ${realms.length}`);
    
    if (realms.length > 0) {
      console.log('\n--- Realm Details ---');
      for (const realm of realms) {
        console.log(`\nRealm: ${realm.name}`);
        console.log(`ID: ${realm._id}`);
        console.log(`Owner: ${realm.owner_id}`);
        console.log(`Share ID: ${realm.share_id}`);
        
        // Check the first few tiles to see what theme they have
        if (realm.map_data && realm.map_data.rooms) {
          const firstRoom = realm.map_data.rooms[0];
          if (firstRoom && firstRoom.grid && firstRoom.grid.length > 0) {
            console.log(`First room name: ${firstRoom.name}`);
            console.log(`Sample tiles:`, firstRoom.grid.slice(0, 5).map((row: any) => 
              row.slice(0, 3).map((tile: any) => tile.tile)
            ));
          }
        }
      }
    } else {
      console.log('\n⚠️ No realms found in database!');
      console.log('This means you might need to create a new office first.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDatabase();
