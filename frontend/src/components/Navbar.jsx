import { HelpCircle, LogOut, Search, Settings, Menu, X, Bookmark } from "lucide-react";
import Logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1280);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = searchQuery.trim();
    if (searchTerm) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchQuery('');
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1280);
      if (window.innerWidth >= 1280) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    const { message } = await logout();
    toast.success(message);
    setShowMenu(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'TV Shows', path: '/tv-shows' },
    { name: 'Movies', path: '/movies' },
    { name: 'Anime', path: '/anime' },
    { name: 'Games', path: '/games' },
    { name: 'New & Popular', path: '/new' },
    { name: 'Upcoming', path: '/upcoming' },
    ...(user ? [{ name: 'Saved', path: '/saved' }] : []),
  ];

  return (
    <nav className="bg-black text-gray-200 relative">
      <div className="flex justify-between items-center p-4 h-20">
        {/* Logo */}
        <div className="flex items-center">
          <button 
            className="xl:hidden text-white mr-4"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="flex-shrink-0">
            <img
              src={Logo}
              alt="Logo"
              className="w-14 cursor-pointer brightness-125"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden xl:flex space-x-6 ml-2">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link 
                to={link.path} 
                className="text-sm hover:text-[#641374] transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right side elements */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#333333] px-4 py-2 rounded-full w-48 md:w-56 lg:w-64 pr-10 outline-none text-sm text-white"
              placeholder="Search movies..."
            />
            <button type="submit" className="absolute right-3 top-2.5">
              <Search className="w-4 h-4 text-gray-400" />
            </button>
          </form>

          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to={user ? "/ai-recommendations" : "/signin"} className="hidden sm:block">
              <button className="bg-[#641374] px-3 py-1.5 md:px-4 md:py-2 text-white text-sm rounded hover:bg-[#7a1a8f] transition-colors">
                Get AI Picks
              </button>
            </Link>

            {!user ? (
              <Link to="/signin">
                <button className="border border-[#333333] py-1.5 px-3 md:py-2 md:px-4 text-sm rounded hover:bg-[#1a1a1a] transition-colors">
                  Sign In
                </button>
              </Link>
            ) : (
              <div className="relative">
                <img
                  src="https://api.dicebear.com/9.x/bottts/svg?seed=Adrian"
                  alt="Profile"
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-[#641374] cursor-pointer"
                  onClick={() => setShowMenu(!showMenu)}
                />

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#232323] bg-opacity-95 rounded-lg z-50 shadow-lg py-4 px-3 flex flex-col gap-2 border border-[#333333]">
                    <div className="flex flex-col items-center mb-2">
                      <span className="text-white font-semibold text-sm md:text-base">
                        {user.username}
                      </span>
                      <span className="text-xs text-gray-400">{user.email}</span>
                    </div>

                    <Link to="/saved" className="flex items-center px-4 py-3 rounded-lg text-white bg-[#181818] hover:bg-[#1d1c1c] gap-3 text-sm md:text-base">
                      <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
                      My Saved Movies
                    </Link>

                    <Link to="/help" className="flex items-center px-4 py-3 rounded-lg text-white bg-[#181818] hover:bg-[#1d1c1c] gap-3 text-sm md:text-base">
                      <HelpCircle className="w-4 h-4 md:w-5 md:h-5" />
                      Help Center
                    </Link>

                    <Link to="/settings" className="flex items-center px-4 py-3 rounded-lg text-white bg-[#181818] hover:bg-[#1d1c1c] gap-3 text-sm md:text-base">
                      <Settings className="w-4 h-4 md:w-5 md:h-5" />
                      Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-3 rounded-lg text-white bg-[#181818] hover:bg-[#1d1c1c] gap-3 text-sm md:text-base"
                    >
                      <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isMobile && (
        <div className="xl:hidden bg-[#1a1a1a] py-4 px-6 border-t border-[#333333]">
          <div className="mb-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                className="bg-[#333333] px-4 py-2 rounded-full w-full pr-10 outline-none text-sm"
                placeholder="Search..."
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  className="block py-2 px-2 text-sm hover:text-[#641374] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          
          {!user ? (
            <div className="mt-4 pt-4 border-t border-[#333333]">
              <Link to="/signin" className="block w-full text-center py-2 border border-[#641374] text-[#641374] rounded hover:bg-[#641374] hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-[#333333] space-y-2">
              <Link to="/saved" className="flex items-center justify-center gap-2 py-2 px-4 text-white hover:bg-[#333333] transition-colors">
                <Bookmark className="w-4 h-4" />
                My Saved Movies
              </Link>
              <Link to="/ai-recommendations" className="block w-full text-center py-2 bg-[#641374] text-white rounded hover:bg-[#7a1a8f] transition-colors">
                AI Movie Picks
              </Link>
              <Link to="/profile" className="block w-full text-center py-2 border border-[#333333] rounded hover:bg-[#1d1d1d] transition-colors">
                My Profile
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
