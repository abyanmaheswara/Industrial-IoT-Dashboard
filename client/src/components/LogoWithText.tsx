import Logo from './Logo';

interface LogoWithTextProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

function LogoWithText({ size = 'md', showTagline = false }: LogoWithTextProps) {
  const sizes = {
    sm: { logo: 32, text: 'text-lg', tagline: 'text-xs' },
    md: { logo: 40, text: 'text-xl', tagline: 'text-sm' },
    lg: { logo: 56, text: 'text-3xl', tagline: 'text-base' }
  };

  const config = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <Logo size={config.logo} />
      <div>
        <h1 className={`${config.text} font-bold tracking-tight`}>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400">
            FACTORY
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-700">
            FORGE
          </span>
        </h1>
        {showTagline && (
          <p className={`${config.tagline} text-industrial-400 font-medium`}>
            Industrial IoT Platform
          </p>
        )}
      </div>
    </div>
  );
}

export default LogoWithText;
