import ContactInfo from '../components/ContactInfo';
import { motion } from 'framer-motion';

const welcomeVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const ContactPage = () => {
  return (
    <main className="pt-24">
      <motion.section className="py-20 bg-gradient-to-b from-white to-pink-50" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={welcomeVariants}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-pink-600">Welcome to RoyalBeauty</h1>
          <p className="text-gray-600 mb-6">We’re here to help you look and feel your best. Reach out with questions, bookings, or just to say hello.</p>
          <p className="text-gray-500">Scroll down for our contact details and opening hours.</p>
        </div>
      </motion.section>

      {/* Contact details placed below welcome section */}
      <ContactInfo />
    </main>
  );
};

export default ContactPage;
