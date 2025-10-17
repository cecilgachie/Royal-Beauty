import { useState } from 'react';
import { X } from 'lucide-react';
import SectionTitle from './SectionTitle';
import LazyImage from './LazyImage';

const galleryImages = [
  {
    id: 1,
  url: '/images/hair001.jpg',
    alt: 'Twist hairstyle',
  },
  {
    id: 2,
  url: '/images/hair008.jpg',
    alt: 'Professional Styles',
  },
  {
    id: 3,
  url: '/images/5.jpg',
    alt: 'Beautiful braids',
  },
  {
    id: 4,
  url: '/images/hair003.jpg',
    alt: 'Lock Style',
  },
  {
    id: 5,
  url: '/images/hair009.jpg',
    alt: 'Cornrow',
  },
  {
    id: 6,
  url: '/images/hair010.jpg',
    alt: 'Cornrow Style',
  },
  {
    id: 7,
  url: '/images/hair012.jpg',
    alt: 'Men Style',
  },
  {
    id: 8,
  url: '/images/hair011.jpg',
    alt: 'Hair colouring',
  },
  {
    id: 9,
  url: '/images/piercing001.jpg',
    alt: 'Ear piercing',
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
