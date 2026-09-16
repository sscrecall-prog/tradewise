import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  variant?: 'circular' | 'rounded';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  className = '',
  onClick,
  variant = 'circular'
}) => {
  const sizeMap = {
    xs: { img: 'w-6 h-6', text: 'text-sm', badge: 'text-[9px]' },
    sm: { img: 'w-7 h-7', text: 'text-base', badge: 'text-[10px]' },
    md: { img: 'w-9 h-9', text: 'text-base', badge: 'text-[10px]' },
    lg: { img: 'w-12 h-12', text: 'text-lg', badge: 'text-xs' },
    xl: { img: 'w-16 h-16', text: 'text-2xl', badge: 'text-xs' }
  };

  const selectedSize = sizeMap[size];
  const shapeClass = variant === 'circular' ? 'rounded-full' : 'rounded-2xl';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Golden Bull Emblem Container */}
      <div className="relative flex-shrink-0">
        <div
          className={`${selectedSize.img} ${shapeClass} overflow-hidden bg-[#0A140F] border border-amber-500/40 shadow-md shadow-amber-500/15 group-hover:border-amber-400/80 group-hover:scale-105 group-hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center`}
        >
          <img
            src="/logo.png"
            alt="TradeWise Golden Bull Logo"
            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500"
            loading="eager"
          />
        </div>
        {/* Ambient Golden Glow Dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-bg-primary animate-pulse" />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider text-text-primary ${selectedSize.text} bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent group-hover:brightness-110 transition-all`}
            >
              TRADEWISE
            </span>
            <span
              className={`${selectedSize.badge} px-1.5 py-0.5 rounded font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40 shadow-xs`}
            >
              PRO
            </span>
          </div>
          <p className="text-[10px] text-text-muted font-medium tracking-tight whitespace-nowrap">
            Discipline &amp; Edge • Indian Markets
          </p>
        </div>
      )}
    </div>
  );
};
