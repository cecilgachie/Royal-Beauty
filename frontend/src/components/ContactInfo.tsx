import { MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const ContactInfo = () => {
  return (
    <motion.section className="py-20 bg-white" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={container}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2 className="text-3xl font-bold mb-4 text-pink-600" variants={item}>Get in touch</motion.h2>
        <motion.p className="text-gray-600 mb-8" variants={item}>We'd love to hear from you — whether you have a question, want to book, or need recommendations.</motion.p>

        <motion.div className="bg-gradient-to-r from-pink-200 to-yellow-50 rounded-2xl p-8" variants={item}>
          <h3 className="text-xl font-semibold mb-4 text-pink-600">Contact Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div className="flex items-start space-x-3" variants={item}>
              <MapPin className="w-5 h-5 text-[#f5c542] mt-1 flex-shrink-0" />
              <p className="text-gray-700">123 Beauty Boulevard<br/>New York, NY 10001</p>
            </motion.div>
            <motion.div className="flex items-start space-x-3" variants={item}>
              <Phone className="w-5 h-5 text-[#f5c542] mt-1 flex-shrink-0" />
              <p className="text-gray-700">+1 (555) 123-4567</p>
            </motion.div>
            <motion.div className="flex items-start space-x-3" variants={item}>
              <Mail className="w-5 h-5 text-[#f5c542] mt-1 flex-shrink-0" />
              <p className="text-gray-700">info@royalbeauty.com</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ContactInfo;
