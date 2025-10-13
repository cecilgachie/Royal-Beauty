import { Sparkles, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="flex items-center justify-center space-x-3">
          <Sparkles className="w-6 h-6 text-[#f5c542]" />
          <span className="font-medium">RoyalBeauty</span>
        </div>
        <div className="mt-4 text-gray-400 text-sm">Copyright &copy; 2025 RoyalBeauty Salon. All rights reserved.</div>
        <div className="mt-4 flex items-center justify-center space-x-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400">
            <Twitter className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
