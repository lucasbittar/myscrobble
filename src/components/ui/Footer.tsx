'use client';

import { useTranslations } from 'next-intl';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const t = useTranslations('footer');

  return (
    <footer className={`mt-auto py-8 px-6 md:px-12 bg-white/60 dark:bg-white/5 backdrop-blur-xl border-t border-border/50 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Primary row - Branding and creator credit */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-border/30">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">MyScrobble</span>
            <span className="text-sm text-muted-foreground">.fm</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('madeWith')} <span className="text-red-500">&#10084;</span> {t('by')}{' '}
            <a
              href="https://lucasbittar.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              Lucas
            </a>
          </p>
        </div>

        {/* Disclaimer section */}
        <div className="pt-6 pb-4">
          <p className="text-xs text-muted-foreground/70 text-center max-w-3xl mx-auto leading-relaxed">
            {t('disclaimer')}
          </p>
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground/50 flex items-center justify-center gap-1">
            {t('tagline')} <span className="text-yellow-500">&#10024;</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
