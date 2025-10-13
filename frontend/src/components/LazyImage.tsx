import React, { useEffect, useRef, useState } from 'react';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  lqip?: string; // small base64 placeholder
};

const shimmer = (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g">
        <stop stopColor="#f3f4f6" offset="20%" />
        <stop stopColor="#e5e7eb" offset="50%" />
        <stop stopColor="#f3f4f6" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#f3f4f6" />
    <rect id="r" width="100%" height="100%" fill="url(#g)" />
    <animate xlinkHref="#r" attributeName="x" from="-100%" to="100%" dur="1.2s" repeatCount="indefinite" />
  </svg>
);

const LazyImage: React.FC<Props> = ({ src, alt, className, lqip, ...rest }) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isVisible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
          }
        });
      }, { rootMargin: '100px' });
      obs.observe(el);
      return () => obs.disconnect();
    }
    setVisible(true);
  }, []);

  return (
    <div ref={wrapperRef} className={`relative overflow-hidden ${className || ''}`} aria-busy={!loaded}>
      {/* placeholder: LQIP if provided, otherwise shimmer */}
      {!loaded && (
        <div className="absolute inset-0 w-full h-full">
          {lqip ? (
            <img src={lqip} alt={alt} className="w-full h-full object-cover filter blur-sm scale-105" />
          ) : (
            <div className="w-full h-full bg-gray-200">
              <div className="w-full h-full">{shimmer}</div>
            </div>
          )}
        </div>
      )}

      {isVisible && (
        <img
          ref={imgRef}
          src={typeof src === 'string' ? src : undefined}
          alt={alt}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          {...(rest as any)}
        />
      )}
    </div>
  );
};

export default LazyImage;
