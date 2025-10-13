interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

const SectionTitle = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <div className="text-center mb-12" data-aos="fade-up">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
      )}
      <div className="flex items-center justify-center mt-4 space-x-2">
        <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-[#f5c542] rounded"></div>
        <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-[#f5c542] rounded"></div>
        <div className="h-1 w-12 bg-gradient-to-r from-pink-500 to-[#f5c542] rounded"></div>
      </div>
    </div>
  );
};

export default SectionTitle;
