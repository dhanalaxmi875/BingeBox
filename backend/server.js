import express from "express";
import { connectToDB, getDbStatus } from "./config/db.js";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import watchHistoryRoutes from "./routes/watchHistory.routes.js";
import savedMoviesRoutes from "./routes/savedMovies.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import { verifyToken } from "./middleware/auth.middleware.js";
import mongoose from 'mongoose';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS middleware - must be before API routes
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://aiflix-1.onrender.com',
    'https://aiflix-ab8d.onrender.com'
  ];
  
  const origin = req.headers.origin;
  
  // For development, allow all origins
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } 
  // For production, only allow specific origins
  else if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    return res.status(200).end();
  }
  
  // For non-preflight requests, still set CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  next();
});

// API Routes
app.use("/api/watch-history", watchHistoryRoutes);
app.use("/api/saved-movies", savedMoviesRoutes);
app.use("/api/reviews", reviewRoutes);

// Test routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.get('/api/saved-movies/test', (req, res) => {
  res.json({ message: 'Saved movies API is working!' });
});

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Test route to verify all routes are working
app.get('/api/routes-test', (req, res) => {
  const routes = [
    { method: 'GET', path: '/api/test', description: 'Basic API test' },
    { method: 'GET', path: '/api/saved-movies/test', description: 'Saved movies test' },
    { method: 'POST', path: '/api/saved-movies', description: 'Save a movie' },
    { method: 'GET', path: '/api/saved-movies', description: 'Get saved movies' },
    { method: 'DELETE', path: '/api/saved-movies/:movieId', description: 'Remove a saved movie' }
  ];
  
  res.json({
    status: 'success',
    message: 'Available routes',
    routes: routes,
    timestamp: new Date().toISOString()
  });
});

// Simple status route to verify the server is running
app.get('/api/status', (req, res) => {
  console.log('Status endpoint hit');
  
  // Basic status response
  const status = {
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
      state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform,
    uptime: process.uptime()
  };
  
  console.log('Sending status:', status);
  res.status(200).json(status);
});

// Extended status with database collections (for debugging)
app.get('/api/status/db', async (req, res) => {
  try {
    console.log('Database status endpoint hit');
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: 'error',
        message: 'Database not connected',
        readyState: mongoose.connection.readyState
      });
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.status(200).json({
      status: 'success',
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('Error in database status check:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get database status',
      error: error.message
    });
  }
});


app.get("/", (req, res) => {
  res.send("Subscribe To My Channel!");
});

app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      throw new Error("All fields are required!");
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "Username is taken, try another name." });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const userDoc = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // JWT

    if (userDoc) {
      // jwt.sign(payload, secret, options)
      const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    return res
      .status(200)
      .json({ user: userDoc, message: "User created successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcryptjs.compareSync(
      password,
      userDoc.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // JWT
    if (userDoc) {
      // jwt.sign(payload, secret, options)
      const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    return res
      .status(200)
      .json({ user: userDoc, message: "Logged in successfully." });
  } catch (error) {
    console.log("Error Logging in: ", error.message);
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/fetch-user", async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userDoc = await User.findById(decoded.id).select("-password");

    if (!userDoc) {
      return res.status(400).json({ message: "No user found." });
    }

    res.status(200).json({ user: userDoc });
  } catch (error) {
    console.log("Error in fetching user: ", error.message);
    return res.status(400).json({ message: error.message });
  }
});

app.post("/api/logout", async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

// Start the server
const startServer = async () => {
  try {
    // Connect to the database first
    await connectToDB();
    
    // Start listening for requests
    const server = app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${mongoose.connection.name}@${mongoose.connection.host}`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();
