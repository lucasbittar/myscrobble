'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CRTWrapper, GlowText, TerminalButton, TerminalCard } from '@/components/crt';
import { Suspense } from 'react';

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access was denied. You may have declined the permissions.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An unexpected error occurred during authentication.',
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  const message = errorMessages[error] || errorMessages.Default;

  return (
    <CRTWrapper>
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <TerminalCard title="system.error">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="font-terminal text-3xl">
                  <GlowText color="magenta">ERROR</GlowText>
                </h1>
                <p className="mt-2 text-sm text-[#ff4444]">{error}</p>
              </div>

              <div className="rounded border border-[rgba(255,68,68,0.3)] bg-[rgba(255,68,68,0.1)] p-4">
                <p className="font-mono text-sm text-[#e0e0e0]">{message}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="font-mono">
                  <span className="text-[#00ff41]">&gt;</span>{' '}
                  <span className="text-[#888888]">Troubleshooting:</span>
                </div>
                <ul className="ml-4 space-y-1 font-mono text-xs text-[#00f5ff]">
                  <li>• Make sure you have a Spotify account</li>
                  <li>• Check that cookies are enabled</li>
                  <li>• Try clearing your browser cache</li>
                  <li>• Try again in a few minutes</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Link href="/auth/login" className="flex-1">
                  <TerminalButton variant="secondary" className="w-full">
                    TRY AGAIN
                  </TerminalButton>
                </Link>
                <Link href="/" className="flex-1">
                  <TerminalButton variant="ghost" className="w-full">
                    GO HOME
                  </TerminalButton>
                </Link>
              </div>
            </div>
          </TerminalCard>
        </motion.div>
      </div>
    </CRTWrapper>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <CRTWrapper>
        <div className="flex min-h-screen items-center justify-center">
          <div className="font-terminal text-2xl text-[#00ff41]">Loading...</div>
        </div>
      </CRTWrapper>
    }>
      <ErrorContent />
    </Suspense>
  );
}
