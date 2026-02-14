function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle - Metallic Brown */}
      <circle cx="50" cy="50" r="48" fill="url(#metalBrown)" />
      
      {/* Factory Silhouette */}
      <path
        d="M25 65 L25 45 L35 45 L35 40 L45 40 L45 35 L55 35 L55 40 L65 40 L65 45 L75 45 L75 65 Z"
        fill="#4A2C2A"
        opacity="0.8"
      />
      
      {/* Chimney Smoke */}
      <path
        d="M40 30 Q42 25 40 20"
        stroke="#FF8C42"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M60 35 Q62 30 60 25"
        stroke="#FF8C42"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      
      {/* Gear Element - Orange */}
      <g transform="translate(50, 75)">
        <circle r="8" fill="#FF6B35" />
        <circle r="4" fill="#8B4513" />
        {/* Gear teeth */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * 8;
          const y = Math.sin(rad) * 8;
          return (
            <rect
              key={i}
              x={x - 1.5}
              y={y - 1.5}
              width="3"
              height="3"
              fill="#FF8C42"
              transform={`rotate(${angle} ${x} ${y})`}
            />
          );
        })}
      </g>
      
      {/* Circuit Lines - Orange */}
      <path
        d="M20 55 L30 55 M70 55 L80 55"
        stroke="#FF6B35"
        strokeWidth="1.5"
        opacity="0.7"
      />
      <circle cx="30" cy="55" r="2" fill="#FF8C42" />
      <circle cx="70" cy="55" r="2" fill="#FF8C42" />
      
      {/* IoT Connection Dots */}
      <circle cx="35" cy="50" r="1.5" fill="#FF6B35" opacity="0.8" />
      <circle cx="65" cy="50" r="1.5" fill="#FF6B35" opacity="0.8" />
      <circle cx="50" cy="42" r="1.5" fill="#FF6B35" opacity="0.8" />
      
      {/* Gradients */}
      <defs>
        <linearGradient id="metalBrown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#8B4513', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#A0522D', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#6B3410', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default Logo;
