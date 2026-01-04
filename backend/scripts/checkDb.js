import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Successfully connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if reviews collection exists
    const reviewsExist = collections.some(c => c.name === 'reviews');
    console.log(`\nReviews collection exists: ${reviewsExist ? 'Yes' : 'No'}`);
    
    // Get document count in reviews collection if it exists
    if (reviewsExist) {
      const reviewCount = await mongoose.connection.db.collection('reviews').countDocuments();
      console.log(`Number of reviews: ${reviewCount}`);
    }
    
    // List all registered models
    console.log('\nRegistered Mongoose models:');
    console.log(mongoose.modelNames());
    
    // Close the connection
    await mongoose.connection.close();
    console.log('\nConnection closed');
    
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
