import { useState } from 'react';
import { X } from 'lucide-react';
import SectionTitle from './SectionTitle';
import LazyImage from './LazyImage';

const galleryImages = [
  {
    id: 1,
    url: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Elegant hairstyle',
  },
  {
    id: 2,
    url: 'https://images.pexels.com/photos/3992860/pexels-photo-3992860.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Professional makeup',
  },
  {
    id: 3,
    url: 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Beautiful braids',
  },
  {
    id: 4,
    url: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Nail art design',
  },
  {
    id: 5,
    url: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Spa treatment',
  },
  {
    id: 6,
    url: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Facial treatment',
  },
  {
    id: 7,
    url: 'https://images.pexels.com/photos/3992859/pexels-photo-3992859.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Hair coloring',
  },
  {
    id: 8,
    url: 'https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Makeup application',
  },
  {
    id: 9,
    url: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Nail care',
  },
];

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Our Gallery"
          subtitle="Browse through our stunning portfolio of beauty transformations"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedImage(image.url)}
              data-aos="zoom-in"
              data-aos-delay={index * 50}
            >
              <LazyImage src={image.url} alt={image.alt} className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-pink-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white font-medium">{image.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-pink-400 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Gallery preview"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </section>
  );
};

export default Gallery;
