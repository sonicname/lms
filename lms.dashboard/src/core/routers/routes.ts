import { createElement } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import buildGlobRoutes, { type GlobModules } from './route-builder';

// Match both legacy /src/pages and module-based pages under /src/modules/<module>/pages
// Include page files [a-z[]*.tsx and special files: layout.tsx, _layout.tsx, not-found.tsx, _not-found.tsx, error.tsx
const globTree = {
  ...import.meta.glob('/src/{pages,modules/**/pages}/**/[a-z[]*.tsx'),
  ...import.meta.glob('/src/{pages,modules/**/pages}/**/layout.tsx'),
  ...import.meta.glob('/src/{pages,modules/**/pages}/**/_layout.tsx'),
  ...import.meta.glob('/src/{pages,modules/**/pages}/**/not-found.tsx'),
  ...import.meta.glob('/src/{pages,modules/**/pages}/**/_not-found.tsx'),
  ...import.meta.glob('/src/{pages,modules/**/pages}/**/error.tsx'),
};
const tree = buildGlobRoutes(globTree as GlobModules);

const router = createBrowserRouter([
  {
    path: '/',
    children: tree,
    errorElement: createElement(Outlet),
  },
]);

export default router;
