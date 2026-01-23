'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

// Re-export types from shared file for backward compatibility
export {
  type ShareCardType,
  type ShareColorTheme,
  shareColorThemes,
  cardTypeToTheme,
  type DashboardShareData,
  type HistoryShareData,
  type TopChartsShareData,
  type ConcertsShareData,
  type SonicAuraShareData,
  type PodcastsShareData,
  type ShareData,
} from './share-types';

import { ShareData, ShareColorTheme, cardTypeToTheme } from './share-types';

interface ShareContextValue {
  isModalOpen: boolean;
  openModal: (shareData: ShareData, theme?: ShareColorTheme) => void;
  closeModal: () => void;
  currentData: ShareData | null;
  currentTheme: ShareColorTheme;
  userName: string;
  setUserName: (name: string) => void;
}

const ShareContext = createContext<ShareContextValue | null>(null);

export function ShareProvider({ children, userName: initialUserName = 'User' }: { children: ReactNode; userName?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState<ShareData | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ShareColorTheme>('green');
  const [userName, setUserName] = useState(initialUserName);

  const openModal = (shareData: ShareData, theme?: ShareColorTheme) => {
    setCurrentData(shareData);
    setCurrentTheme(theme || cardTypeToTheme[shareData.type]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <ShareContext.Provider
      value={{
        isModalOpen,
        openModal,
        closeModal,
        currentData,
        currentTheme,
        userName,
        setUserName,
      }}
    >
      {children}
    </ShareContext.Provider>
  );
}

export function useShare() {
  const context = useContext(ShareContext);
  if (!context) {
    throw new Error('useShare must be used within a ShareProvider');
  }
  return context;
}

// Safe version that returns null if not in provider (for optional share functionality)
export function useShareSafe() {
  return useContext(ShareContext);
}
