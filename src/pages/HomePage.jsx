import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Hero from '../components/Hero';
import DualTrack from '../components/DualTrack';
import ProjectPath from '../components/SiteIndex';
import PageNav from '../components/PageNav';

/**
 * Home.
 *
 * The hero states the promise, the model explains the ways to work with EKA, and the project
 * path answers the next question a prospective client has: what happens after the first hello?
 * Navigation belongs in the header; the page earns its space by helping a visitor decide.
 */
export default function HomePage() {
  const { loadingComplete } = useOutletContext();

  return (
    <>
      {/* The night field and the particle globe — the one dark panel on the site, and the
          only page that carries it. Untouched by the split. */}
      <Hero ready={loadingComplete} />

      {/* The dual model: services and products, framed as one team sold two ways. */}
      <DualTrack />

      {/* A useful first-project path, rather than a second copy of the navigation. */}
      <ProjectPath />

      <PageNav />
    </>
  );
}
