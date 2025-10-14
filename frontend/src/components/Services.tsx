import { Scissors } from 'lucide-react';
import SectionTitle from './SectionTitle';
import LazyImage from './LazyImage';
import { useBooking } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    id: 1,
    name: 'Locks Installation',
    description: 'Secure and stylish locks installation',
    price: 4000,
    icon: Scissors,
    image: '/src/assets/hair007.jpg',
  },
  {
    id: 2,
    name: 'Knotless Braids',
    description: 'Knotless braids for a natural, lightweight finish',
    price: 700,
    icon: Scissors,
    image: '/src/assets/hair004.jpg',
  },
  {
    id: 3,
    name: 'Normal Braids',
    description: 'Classic braiding styles',
    price: 600,
    icon: Scissors,
    image: '/src/assets/hair005.jpg',
  },
  {
    id: 4,
    name: 'Cornrows',
    description: 'Traditional cornrows for a neat look',
    price: 400,
    icon: Scissors,
    image: '/src/assets/hair010.jpg',
  },
  {
    id: 5,
    name: 'Half Cornrows / Fulani Braids',
    description: 'Stylish half cornrows / Fulani braid styling',
    price: 650,
    icon: Scissors,
    image: '/src/assets/hair008.jpg',
  },
  {
    id: 6,
    name: 'Sister Locks',
    description: 'Delicate sister locks maintenance and installation',
    price: 2500,
    icon: Scissors,
    image: '/src/assets/hair003.jpg',
  },
  {
    id: 7,
    name: 'Natural Twist',
    description: 'Natural twist styling for a soft, elegant look',
    price: 700,
    icon: Scissors,
    image: '/src/assets/hair001.jpg',
  },
  {
    id: 8,
    name: 'Passion Twist',
    description: 'Trendy passion twists for volume and texture',
    price: 700,
    icon: Scissors,
    image: '/src/assets/hair006.jpg',
  },
  {
    id: 9,
    name: 'Twist Out',
    description: 'Defined twist-out styling',
    price: 350,
    icon: Scissors,
    image: '/src/assets/hair011.jpg',
  },
  {
    id: 10,
    name: 'Micro Twist',
    description: 'Small, neat micro twists',
    price: 1000,
    icon: Scissors,
    image: '/src/assets/hair012.jpg',
  },
  {
    id: 11,
    name: 'Ear Piercing',
    description: 'Safe and sterile ear piercing service',
    price: 250,
    icon: Scissors,
    image: '/src/assets/piercing001.jpg',
  },
  {
    id: 12,
    name: 'Stitches',
    description: 'Precision stitching service',
    price: 500,
    icon: Scissors,
    image: '/src/assets/hair009.jpg',
  },
];


const Services = () => {
  const { setBooking, openSidebar } = useBooking();
  const navigate = useNavigate();

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Our Hair Services"
          subtitle="Professional hair care tailored to your unique style"
        />
        <p className="mt-2 text-sm text-gray-600">Note: Each service requires a 50% deposit when booking.</p>

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
