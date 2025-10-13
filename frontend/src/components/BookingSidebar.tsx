import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '../context/BookingContext';
import { useEffect, useRef } from 'react';
import PaymentModal from './PaymentModal';
import { useState } from 'react';

// responsive variants handled inline where needed

const BookingSidebar = () => {
  const { booking, isOpen, closeSidebar, clearBooking } = useBooking();
  const total = booking.price ?? 0;
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeSidebar]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!isOpen) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeSidebar();
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen, closeSidebar]);

  const [showPayment, setShowPayment] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div key="booking-sidebar" className="fixed inset-0 z-40 flex items-end md:items-start justify-center md:justify-end">
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={closeSidebar}
          />

          {/* sidebar: right on desktop, bottom on mobile */}
          <motion.aside
            ref={ref}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full md:w-96 bg-white rounded-t-xl md:rounded-xl shadow-md z-50 p-6 max-h-[90vh] md:top-20 md:bottom-6 md:right-6 md:left-auto overflow-auto"
            role="dialog"
            aria-label="Booking summary"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-semibold">Booking Summary</h4>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearBooking}
                  className="text-sm text-gray-500 hover:text-red-500"
                  aria-label="Clear booking"
                >
                  Clear
                </button>
                <button
                  onClick={closeSidebar}
                  className="p-2 rounded-md hover:bg-gray-100"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3 flex-1">
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium text-gray-800">{booking.service || '—'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-800">{booking.date || '—'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-800">{booking.time || '—'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium text-gray-800">{booking.firstName ? `${booking.firstName} ${booking.lastName || ''}` : '—'}</p>
                <p className="text-sm text-gray-500">{booking.email}</p>
                <p className="text-sm text-gray-500">{booking.phone}</p>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-[#f5c542]">KES {total}</span>
              </div>

              <div className="mt-4">
                <button onClick={() => setShowPayment(true)} className="w-full bg-gradient-to-r from-pink-500 to-[#f5c542] text-white py-3 rounded-xl font-semibold">
                  Proceed to Payment / Deposit
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
      {showPayment && <PaymentModal key="payment-modal" onClose={() => setShowPayment(false)} />}
    </AnimatePresence>
  );
};

export default BookingSidebar;
