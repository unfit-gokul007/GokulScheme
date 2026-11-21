import React, { createContext, useContext, useState } from 'react';
import { INITIAL_PROFILE } from '../lib/constants';
import type { ChatMessage, UserProfile } from '../lib/types';

interface AppStateContextValue {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  clearProfile: () => void;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  clearChat: () => void;
  shareHints: boolean;
  setShareHints: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // Strictly in-memory React state only — never stored in localStorage, cookies, or DB
  const [profile, setProfile] = useState<UserProfile>(() => ({
    ...INITIAL_PROFILE,
    toggles: { ...INITIAL_PROFILE.toggles },
  }));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [shareHints, setShareHints] = useState(false);

  const clearProfile = () => {
    setProfile({
      ...INITIAL_PROFILE,
      toggles: { ...INITIAL_PROFILE.toggles },
    });
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  return (
    <AppStateContext.Provider
      value={{
        profile,
        setProfile,
        clearProfile,
        chatMessages,
        setChatMessages,
        clearChat,
        shareHints,
        setShareHints,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return ctx;
}
