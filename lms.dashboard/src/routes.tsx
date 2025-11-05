import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from './layouts/auth-layout';
import RootLayout from './layouts/root-layout';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: () =>
          import('./pages/homepage').then((module) => ({
            Component: module.default,
          })),
      },
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'sign-in',
            lazy: () =>
              import('./pages/auth/sign-in.page').then((module) => ({
                Component: module.default,
              })),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    lazy: () =>
      import('./components/not-found').then((module) => ({
        Component: module.default,
      })),
  },
]);

export default router;
