import { createContext, useContext, useState, ReactNode } from 'react';

type Booking = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  service?: string;
  date?: string;
  time?: string;
  price?: number;
};

type BookingContextType = {
  booking: Booking;
  setBooking: (b: Booking) => void;
  clearBooking: () => void;
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
};

const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
};

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [booking, setBookingState] = useState<Booking>({});
  const [isOpen, setIsOpen] = useState(false);

  const setBooking = (b: Booking) => {
    setBookingState((prev) => ({ ...prev, ...b }));
  };

  const clearBooking = () => {
    setBookingState({});
  };

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <BookingContext.Provider
      value={{ booking, setBooking, clearBooking, isOpen, openSidebar, closeSidebar }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;
