import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // TODO: Replace with real admin check (e.g., from context or auth)
  const isAdmin = false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    // use react-router navigation for pages
    navigate(`/${id === 'home' ? '' : id}`);
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-[#f5c542]" />
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-[#f5c542] bg-clip-text text-transparent">
              RoyalBeauty
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-gray-700 hover:text-pink-500 transition-colors font-medium">Home</button>
            <button onClick={() => scrollToSection('services')} className="text-gray-700 hover:text-pink-500 transition-colors font-medium">Services</button>
            <button onClick={() => scrollToSection('gallery')} className="text-gray-700 hover:text-pink-500 transition-colors font-medium">Gallery</button>
            <button onClick={() => scrollToSection('booking')} className="bg-gradient-to-r from-pink-500 to-[#f5c542] text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-medium">Book Now</button>
            <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-pink-500 transition-colors font-medium">Contact</button>
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-700 hover:text-pink-500 transition-colors font-medium border-l pl-4 ml-4"
              >
                Admin
              </button>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-pink-500 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <button onClick={() => scrollToSection('home')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors font-medium">Home</button>
            <button onClick={() => scrollToSection('services')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors font-medium">Services</button>
            <button onClick={() => scrollToSection('gallery')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors font-medium">Gallery</button>
            <button onClick={() => scrollToSection('booking')} className="block w-full text-left px-4 py-3 bg-gradient-to-r from-pink-500 to-[#f5c542] text-white rounded-lg hover:shadow-lg transition-all font-medium">Book Now</button>
            <button onClick={() => scrollToSection('contact')} className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors font-medium">Contact</button>
            {isAdmin && (
              <button
                onClick={() => { navigate('/admin'); setIsOpen(false); }}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors font-medium border-t mt-2"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
