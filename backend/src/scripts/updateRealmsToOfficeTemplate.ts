import mongoose from 'mongoose';
import { Realm } from '../db/models/Realm';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Load the new office template
const officeTemplatePath = path.join(__dirname, '../../../frontend/utils/defaultOfficeTemplate.json');
const officeTemplate = JSON.parse(fs.readFileSync(officeTemplatePath, 'utf-8'));

async function updateAllRealmsToOfficeTemplate() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowspace';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('URI:', MONGODB_URI.substring(0, 20) + '...');

    // Find all realms
    const realms = await Realm.find({});
    console.log(`Found ${realms.length} realms to update`);

    // Update each realm with the new office template
    for (const realm of realms) {
      realm.map_data = officeTemplate;
      await realm.save();
      console.log(`Updated realm: ${realm.name} (ID: ${realm._id})`);
    }

    console.log('✅ All realms updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating realms:', error);
    process.exit(1);
  }
}

updateAllRealmsToOfficeTemplate();
