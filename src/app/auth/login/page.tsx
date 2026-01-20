'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ModernWrapper, BlobBackground, ModernCard, ModernButton, Heading } from '@/components/modern';

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations('auth.login');

  const handleSpotifyLogin = () => {
    // Use custom OAuth route instead of NextAuth's signIn
    router.push('/api/auth/signin/spotify');
  };

  return (
    <ModernWrapper>
      {/* Background decorations */}
      <BlobBackground
        color="purple"
        position="top-right"
        size="lg"
      />
      <BlobBackground
        color="teal"
        position="bottom-left"
        size="xl"
      />

      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <ModernCard className="shadow-soft-lg">
            <div className="space-y-6">
              <div className="text-center">
                <Heading level={3} className="text-foreground">
                  {t('title')}
                </Heading>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t('subtitle')}
                </p>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="text-sm">
                  <span className="text-primary font-medium">→</span>{' '}
                  <span className="text-muted-foreground">{t('permissions')}</span>
                </div>
                <ul className="ml-4 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {t('permissionsList.recentlyPlayed')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {t('permissionsList.topItems')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {t('permissionsList.library')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {t('permissionsList.nowPlaying')}
                  </li>
                </ul>
              </div>

              <ModernButton
                onClick={handleSpotifyLogin}
                size="lg"
                className="w-full gap-2"
              >
                <SpotifyIcon className="h-5 w-5" />
                {t('button')}
              </ModernButton>

              <p className="text-center text-xs text-muted-foreground/70">
                {t('disclaimer')}
              </p>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </ModernWrapper>
  );
}
