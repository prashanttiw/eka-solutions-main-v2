import React from 'react';
import { Button, Eyebrow } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="notfound-page section">
      <div className="wrap">
        <Eyebrow>Page not found</Eyebrow>
        <h1 className="h-display">This path does not <em>go anywhere.</em></h1>
        <p className="body">The link may be old, or the address mistyped. Start again from the homepage, or tell us what you were looking for.</p>
        <div className="actions">
          <Button to="/" dir="back">Back to home</Button>
          <Button to="/contact" variant="ghost">Contact EKA</Button>
        </div>
      </div>
    </div>
  );
}
