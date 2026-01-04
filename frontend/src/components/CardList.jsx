import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

const CardList = ({ title, category }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Map categories to different page numbers to show different movies
  const categoryPages = {
    now_playing: 1,
    popular: 2,
    top_rated: 3,
    upcoming: 4
  };

  const page = categoryPages[category] || 1;
  // Using multiple API keys as fallback
  const API_KEYS = [
    "3d39c6b8a0f205e53daaaf08cdca82b8", // New key 1
    "95a301edd60a37f749f38e4af12cd17a", // Original key
    "4e44d9029b1270a757cddc766a1bcb63", // Fallback key 2
    "b4655e0e2aae7b4a7a3d49d8d0a9b8c1"  // Fallback key 3
  ];
  
  // Function to fetch movies with retry logic
  const fetchWithRetry = async (category, page, retryCount = 0) => {
    if (retryCount >= API_KEYS.length) {
      console.error('All API keys exhausted');
      return [];
    }
    
    const currentKey = API_KEYS[retryCount];
    const url = `https://api.themoviedb.org/3/movie/${category}?api_key=${currentKey}&language=en-US&page=${page}`;
    
    console.log(`Attempt ${retryCount + 1} with key: ${currentKey.substring(0, 5)}...`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.warn(`Attempt ${retryCount + 1} failed with status ${response.status}`);
        if (response.status === 401) {
          return fetchWithRetry(category, page, retryCount + 1);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return data.results || [];
    } catch (error) {
      console.error(`Attempt ${retryCount + 1} error:`, error.message);
      if (retryCount < API_KEYS.length - 1) {
        return fetchWithRetry(category, page, retryCount + 1);
      }
      throw error;
    }
  };

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      
      try {
        console.log(`Fetching ${category} movies (page ${page})...`);
        const results = await fetchWithRetry(category, page);
        
        // Filter out movies without backdrop images
        const validMovies = results.filter(movie => movie?.backdrop_path);
        
        if (validMovies.length === 0) {
          console.warn(`No valid movies found for ${category} (page ${page})`);
        } else {
          console.log(`Successfully fetched ${validMovies.length} movies for ${category}`);
        }
        
        setData(validMovies);
      } catch (error) {
        console.error(`Error fetching ${category} movies:`, error);
        // Set empty array to prevent UI errors
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [category, page]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="text-white md:px-4">
        <h2 className="pt-10 pb-5 text-lg font-medium">{title}</h2>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-48 flex-shrink-0">
              <div className="h-40 bg-gray-800 rounded-lg animate-pulse"></div>
              <div className="h-4 mt-2 bg-gray-800 rounded animate-pulse w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white md:px-4">
      <h2 className="pt-10 pb-5 text-lg font-medium">{title}</h2>
      
      <Swiper 
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView="auto"
        navigation
        className="relative"
        breakpoints={{
          320: { slidesPerView: 2 },
          480: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 }
        }}
      >
        {data.map((movie) => (
          <SwiperSlide key={movie.id} className="!w-auto">
            <motion.div 
              className="group relative w-48 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link to={`/movie/${movie.id}`} className="block">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.backdrop_path}`}
                  alt={movie.title || movie.original_title}
                  className="w-full h-40 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x281?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {movie.title || movie.original_title}
                  </p>
                </div>
              </Link>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CardList;
