import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppStateProvider } from './context/AppStateContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TranslationNotice } from './components/TranslationNotice';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ResultsPage } from './pages/ResultsPage';
import { SchemesPage } from './pages/SchemesPage';
import { AssistantPage } from './pages/AssistantPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { t } = useTranslation();

  return (
    <AppStateProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col bg-[#FAF9F5] text-slate-900">
          <a href="#main-content" className="skip-link">
            {t('common.skipToContent')}
          </a>
          <Header />
          <TranslationNotice />
          <main id="main-content" className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/schemes" element={<SchemesPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppStateProvider>
  );
}
