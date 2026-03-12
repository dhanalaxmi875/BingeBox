# 🎬 BingeBox - Your Ultimate Movie Streaming Platform (MERN Stack 2025)

A full-featured **BingeBox Clone** built with the **MERN stack** (MongoDB, Express.js, React, Node.js) featuring **AI-powered movie recommendations**, user authentication, and a rich set of features for movie enthusiasts.

## 🚀 Key Features

### 🎬 Core Features
- **Movie Browsing & Discovery**
  - Browse trending, popular, and upcoming movies
  - Search functionality with instant results
  - Detailed movie pages with trailers and cast information

### 🤖 AI-Powered Recommendations
- **Gemini AI Integration**
  - Mood-based movie suggestions
  - Personalized recommendations based on watch history
  - Natural language processing for intuitive search

### 👤 User Experience
- **Complete Authentication System**
  - Secure JWT-based authentication
  - Email/password and social login options
  - Password reset functionality

### 📚 Watchlist & History
- **Watch History**
  - Automatically tracks watched movies
  - Resume watching feature
  - Watch progress tracking
- **Saved Movies**
  - Create and manage watchlists
  - Save movies to watch later
  - Organize by custom categories

### 💬 Community & Reviews
- **Movie Reviews & Ratings**
  - Rate and review movies
  - Read community reviews
  - Like and comment on reviews

### 🛠️ Technical Features
- **Responsive Design**
  - Mobile-first approach
  - Cross-browser compatibility
  - Optimized for all screen sizes
- **Performance Optimized**
  - Code splitting
  - Lazy loading
  - Image optimization
- **Secure & Reliable**
  - Rate limiting
  - Input validation
  - XSS protection

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19+ with Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Bcrypt.js
- **Environment**: dotenv

### AI & External Services
- **AI Recommendations**: Google Gemini AI
- **Movie Data**: TMDB API

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB Atlas account or local MongoDB instance
- TMDB API key
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bingebox.git
   cd bingebox
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Environment Variables**

   **Backend (`.env`)**
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   TMDB_API_KEY=your_tmdb_api_key
   NODE_ENV=development
   ```

   **Frontend (`.env`)**
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   ```

5. **Run the application**
   ```bash
   # In the backend directory
   npm run dev
   
   # In the frontend directory (new terminal)
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

---

## 🛠️ Development

### Project Structure

```
bingebox/
├── frontend/              # React frontend
│   ├── public/           # Static files
│   └── src/
│       ├── assets/       # Images, fonts, etc.
│       ├── components/   # Reusable UI components
│       ├── hooks/        # Custom React hooks
│       ├── pages/        # Page components
│       ├── services/     # API services
│       ├── store/        # State management
│       └── utils/        # Utility functions
│
└── backend/              # Express.js backend
    ├── config/          # Configuration files
    ├── controllers/     # Route controllers
    ├── middleware/      # Custom middleware
    ├── models/         # Database models
    ├── routes/         # API routes
    └── utils/          # Helper functions
```

### Available Scripts

**Frontend**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

**Backend**
```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for the movie data
- [Google Gemini](https://ai.google/gemini/) for the AI capabilities
- All the amazing open-source libraries used in this project

---

⭐️ Don't forget to star this repository if you found it useful!
