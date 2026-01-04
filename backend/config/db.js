import mongoose from 'mongoose';

export async function connectToDB() {
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  // Enable debug mode in development
  if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', true);
  }

  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    socketTimeoutMS: 45000, // 45 seconds socket timeout
    family: 4, // Use IPv4, skip trying IPv6
  };

  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoUri, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Log when connected
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });

    // Log connection errors
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    // Log when disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

    return conn;
  } catch (error) {
    console.error('Error connecting to MongoDB:', {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
      error: error
    });
    
    // Graceful shutdown on connection error
    process.exit(1);
  }
}

export function getDbStatus() {
  return {
    readyState: mongoose.connection.readyState,
    db: mongoose.connection.db ? mongoose.connection.db.databaseName : null,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    models: mongoose.modelNames(),
  };
}
