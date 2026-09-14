import React from 'react';
import PageHeader from '../components/PageHeader';
import PageNav from '../components/PageNav';
import ServicesGrid from '../components/ServicesGrid';
import Products from '../components/Products';
import Industries from '../components/Industries';
export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={
          <>
            Built around
            <br />
            <span className="text-[var(--blue)]">your business.</span>
          </>
        }
        lead="Websites, applications, design, and automation. Start with what your business needs to achieve; we can shape the right solution together."
        sections={[
          { id: 'services', label: 'Our services' },
          { id: 'products', label: 'Connected solutions' },
          { id: 'industries', label: 'Business contexts' },
        ]}
      />
      <ServicesGrid />
      <Products />
      <Industries />
      <PageNav />
    </>
  );
}
