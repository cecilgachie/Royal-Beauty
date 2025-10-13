import Hero from '../components/Hero';
import Services from '../components/Services';
import Gallery from '../components/Gallery';
import BookingForm from '../components/BookingForm';
import SectionTitle from '../components/SectionTitle';

const HomePage = () => {
  return (
    <>
      <Hero />
      <Services />
      <Gallery />
      <BookingForm />

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle title="What Our Clients Say" subtitle="" />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <blockquote className="p-6 bg-pink-50 rounded-xl border border-pink-100">
              <p className="text-gray-800 italic">"The best salon experience I've ever had! The stylists are incredibly talented and the atmosphere is so relaxing."</p>
              <cite className="block mt-4 text-sm font-semibold text-pink-600">— Doris C</cite>
            </blockquote>

            <blockquote className="p-6 bg-yellow-50 rounded-xl border border-yellow-100">
              <p className="text-gray-800 italic">"I've been coming here for years and they never disappoint. My hair always looks amazing after each visit."</p>
              <cite className="block mt-4 text-sm font-semibold text-pink-600">— Suzan</cite>
            </blockquote>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
