import React from "react";
import Hero from "../components/Hero";
import CardList from "../components/CardList";
import Footer from "../components/Footer";
import WatchHistory from "../components/WatchHistory";
import { useAuthStore } from "../store/authStore";

const Homepage = () => {
  const { user } = useAuthStore();
  
  return (
    <div className="p-5">
      <Hero />
      {user && <WatchHistory />}
      <CardList title="Now Playing" category="now_playing" />
      <CardList title="Top Rated" category="top_rated" />
      <CardList title="Popular" category="popular" />
      <CardList title="99" category="upcoming" />
      <Footer />
    </div>
  );
};

export default Homepage;
