import { Scissors, Sparkles, Palette, Hand, Footprints, Smile } from 'lucide-react';
import SectionTitle from './SectionTitle';
import LazyImage from './LazyImage';
import { useBooking } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    id: 1,
    name: 'Hair Braiding',
    description: 'Intricate braiding styles that showcase your unique personality',
    price: 80,
    icon: Scissors,
    image: 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 2,
    name: 'Hair Styling',
    description: 'Professional cuts, colors, and treatments for stunning looks',
    price: 120,
    icon: Sparkles,
    image: 'https://images.pexels.com/photos/3992859/pexels-photo-3992859.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 3,
    name: 'Makeup Artistry',
    description: 'Flawless makeup application for any occasion',
    price: 100,
    icon: Palette,
    image: 'https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 4,
    name: 'Nail Art',
    description: 'Creative and elegant nail designs that make a statement',
    price: 60,
    icon: Hand,
    image: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 5,
    name: 'Pedicure',
    description: 'Relaxing foot care treatments for total rejuvenation',
    price: 70,
    icon: Footprints,
    image: 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: 6,
    name: 'Facial Treatment',
    description: 'Luxurious skincare treatments for radiant, glowing skin',
    price: 90,
    icon: Smile,
    image: 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];


const Services = () => {
  const { setBooking, openSidebar } = useBooking();
  const navigate = useNavigate();

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Our Services"
          subtitle="Discover our range of premium beauty treatments designed to make you feel beautiful"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="relative h-48 overflow-hidden">
                  <LazyImage
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <IconComponent className="w-6 h-6 text-pink-500" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#f5c542]">
                      KES {service.price}
                    </span>
                    <button
                      onClick={() => {
                        setBooking({ service: service.name, price: service.price });
                        openSidebar();
                        navigate('/booking');
                      }}
                      className="bg-gradient-to-r from-pink-500 to-[#f5c542] text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-medium"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
