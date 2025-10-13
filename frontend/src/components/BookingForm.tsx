import { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import SectionTitle from './SectionTitle';
import { useBooking } from '../context/BookingContext';

// services with grouped variants (braiding options grouped under 'Braiding')
const services: Array<any> = [
  { id: 1, name: 'Locks Installation', price: 4000 },
  {
    id: 2,
    name: 'Braiding',
    variants: [
      { id: '2-1', name: 'Knotless Braids', price: 700 },
      { id: '2-2', name: 'Normal Braids', price: 600 },
      { id: '2-3', name: 'Cornrows', price: 400 },
      { id: '2-4', name: 'Half Cornrows / Fulani Braids', price: 650 },
    ],
  },
  { id: 3, name: 'Sister Locks', price: 2500 },
  { id: 4, name: 'Natural Twist', price: 700 },
  { id: 5, name: 'Passion Twist', price: 700 },
  { id: 6, name: 'Twist Out', price: 350 },
  { id: 7, name: 'Micro Twist', price: 1000 },
  { id: 8, name: 'Ear Piercing', price: 250 },
  { id: 9, name: 'Stitches', price: 500 },
];

const BookingForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
  });

  const [selectedPrice, setSelectedPrice] = useState(0);
  const { setBooking, openSidebar } = useBooking();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'service') {
      // value will be formatted as "DisplayName|price" for selected option
      const parts = value.split('|');
      const svcName = parts[0] || value;
      const svcPrice = Number(parts[1]) || 0;
      setSelectedPrice(svcPrice);
      setBooking({ service: svcName, price: svcPrice });
      // keep the formData.service string for display
    }
    if (name === 'time') {
      setBooking({ time: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.service ||
      !formData.date ||
      !formData.time
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    toast.success(
      `Booking confirmed! We'll see you on ${formData.date} at ${formData.time}`,
      {
        duration: 5000,
        icon: '✨',
      }
    );

    // push full booking to context and open sidebar
    setBooking({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      date: formData.date,
      time: formData.time,
      price: selectedPrice,
    });
    openSidebar();

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      service: '',
      date: '',
      time: '',
    });
    setSelectedPrice(0);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id="booking" className="py-20 bg-gradient-to-b from-pink-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Book Your Appointment"
          subtitle="Reserve your spot and experience the royal treatment"
        />

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-[#f5c542] p-8 text-white">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Your Beauty Journey Starts Here</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>First Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                  placeholder="Enter your first name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Last Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                  placeholder="Enter your last name"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </div>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </div>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                  placeholder="07XXXXXXXX (Kenya)"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Select Service</span>
                  </div>
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                >
                  <option value="">Choose a service</option>
                  {services.map((service) => {
                    if (service.variants && Array.isArray(service.variants)) {
                      return (
                        <optgroup key={service.id} label={service.name}>
                          {service.variants.map((v: any) => (
                            <option key={v.id} value={`${v.name}|${v.price}`}>
                              {v.name} - KES {v.price}
                            </option>
                          ))}
                        </optgroup>
                      );
                    }
                    return (
                      <option key={service.id} value={`${service.name}|${service.price}`}>
                        {service.name} - KES {service.price}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Preferred Date</span>
                  </div>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={today}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Preferred Time</span>
                  </div>
                </label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none transition-colors"
                >
                  <option value="">Choose a time</option>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                  <option value="06:00 PM">06:00 PM</option>
                </select>
              </div>
            </div>

            {selectedPrice > 0 && (
              <div className="mt-6 p-6 bg-gradient-to-r from-pink-50 to-yellow-50 rounded-xl border-2 border-pink-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">Selected Service</p>
                    <p className="font-bold text-gray-800 text-lg">{formData.service}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm">Total Price</p>
                    <p className="font-bold text-[#f5c542] text-3xl">KES {selectedPrice}</p>
                    <p className="mt-1 text-sm text-gray-600">Deposit (50%): <span className="font-semibold">KES {Math.round(selectedPrice * 0.5)}</span></p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-8 bg-gradient-to-r from-pink-500 to-[#f5c542] text-white py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all"
            >
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
