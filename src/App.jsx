import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';

/** Each inner page is loaded on demand. The shared shell preserves the navigation
 * and animated footer as visitors move between routes. */
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const PlaybookPage = lazy(() => import('./pages/PlaybookPage'));
const WorkPage = lazy(() => import('./pages/WorkPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

/**
 * What sits there while a page's chunk arrives.
 *
 * Deliberately blank rather than a spinner. On a local network the chunk lands inside a
 * frame or two and a spinner would only ever be seen as a flash of something breaking;
 * the height is what matters, so the footer does not jump up the screen and back down.
 */
function PageFallback() {
  return <div aria-hidden="true" className="min-h-[70svh]" />;
}

const page = (element) => <Suspense fallback={<PageFallback />}>{element}</Suspense>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={page(<AboutPage />)} />
          <Route path="services" element={page(<ServicesPage />)} />
          <Route path="playbook" element={page(<PlaybookPage />)} />
          <Route path="work" element={page(<WorkPage />)} />
          <Route path="careers" element={page(<CareersPage />)} />
          <Route path="contact" element={page(<ContactPage />)} />
          <Route path="*" element={page(<NotFoundPage />)} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
