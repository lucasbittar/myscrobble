'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { ModernWrapper, BlobBackground, ModernCard, ModernButton, Heading } from '@/components/modern';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const t = useTranslations('auth.errors');
  const tCommon = useTranslations('common');

  // Map error codes to translation keys
  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'Configuration':
        return t('configuration');
      case 'AccessDenied':
        return t('accessDenied');
      case 'Verification':
        return t('verification');
      default:
        return t('default');
    }
  };

  const message = getErrorMessage(error);

  return (
    <ModernWrapper>
      {/* Background decorations */}
      <BlobBackground
        color="pink"
        position="top-right"
        size="lg"
      />
      <BlobBackground
        color="purple"
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
                <div className="mb-4 text-5xl">😵</div>
                <Heading level={3} className="text-destructive">
                  {t('title')}
                </Heading>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              </div>

              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                <p className="text-sm text-foreground">{message}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-primary font-medium">→</span>{' '}
                  <span className="text-muted-foreground">{t('troubleshooting')}</span>
                </div>
                <ul className="ml-4 space-y-1 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {t('tips.account')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {t('tips.cookies')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {t('tips.cache')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {t('tips.wait')}
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Link href="/auth/login" className="flex-1">
                  <ModernButton variant="secondary" className="w-full">
                    {tCommon('tryAgain')}
                  </ModernButton>
                </Link>
                <Link href="/" className="flex-1">
                  <ModernButton variant="ghost" className="w-full">
                    {tCommon('goHome')}
                  </ModernButton>
                </Link>
              </div>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </ModernWrapper>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <ModernWrapper>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-2xl font-bold text-primary">Loading...</div>
        </div>
      </ModernWrapper>
    }>
      <ErrorContent />
    </Suspense>
  );
}
