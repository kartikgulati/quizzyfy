declare module '@vercel/analytics/next' {
  import * as React from 'react';

  // Minimal typing for the Next.js Analytics integration from Vercel.
  // We only need to expose the Analytics component for usage in _app.tsx.
  export const Analytics: React.FC<{}>;

  export default Analytics;
}
