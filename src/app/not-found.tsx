'use client';

import type React from 'react';
import { useEffect } from 'react';

const NotFoundPage: React.FC = () => {
  useEffect(() => {}, []);

  return (
    <div>
      <h1>Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
    </div>
  );
};

export default NotFoundPage;
