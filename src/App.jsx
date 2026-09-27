import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import HomePage from './pages/HomePage';

/** Inner pages load on demand; the shared navigation and footer stay mounted. */
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
 * A stable blank area keeps the footer from jumping up while a route chunk arrives.
 */
function PageFallback() {
  return <div aria-hidden="true" className="page-fallback" />;
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
