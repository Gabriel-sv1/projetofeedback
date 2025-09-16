'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export default function LazyImage({ src, alt, width, height, className, priority = false }: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div className={`bg-slate-200 rounded flex items-center justify-center ${className}`}>
        <span className="text-slate-500 text-sm">Venturini&Co</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-slate-200 animate-pulse rounded ${className}`} />
      )}
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          quality={75}
          loading={priority ? 'eager' : 'lazy'}
        />
      </div>
    </div>
  );
}
