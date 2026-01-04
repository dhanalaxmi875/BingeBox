const API_KEY = 'af554b759922046e58f3c06f359f2f1a';
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdb = {
  searchMovies: async (query, page = 1) => {
    try {
      console.log('Searching for:', query);
      
      // Build the URL with query parameters
      const params = new URLSearchParams({
        api_key: API_KEY,
        language: 'en-US',
        query: query,
        page: page,
        include_adult: false
      });

      const url = `${BASE_URL}/search/movie?${params.toString()}`;
      console.log('API Request URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        console.error('TMDB API Error:', data);
        throw new Error(`TMDB API Error: ${data?.status_message || 'Unknown error'}`);
      }
      
      console.log('TMDB Response:', data);
      return data;
    } catch (error) {
      console.error('Error searching movies:', error);
      return { results: [], total_pages: 0 };
    }
  },
};

export default tmdb;
