import { MantineProvider } from '@mantine/core';
import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './core/providers/app-provider';
import router from './core/routers/routes';

import '@mantine/core/styles.css';
import './index.css';

export default function App() {
  return (
    <MantineProvider>
      <AppProvider
        login={(payload: { email: string; password: string }) => {
          // Implement login logic here
          console.log('Login payload:', payload);
          return Promise.resolve();
        }}
        verifyToken={(token: string) => {
          console.log('Verifying token:', token);
          return Promise.resolve(true);
        }}
        logout={() => {
          return Promise.resolve();
        }}
        refreshTokens={(refreshToken: string): Promise<void> => {
          console.log('Refreshing tokens with refreshToken:', refreshToken);
          return Promise.resolve();
        }}
      >
        <RouterProvider router={router} />
      </AppProvider>
    </MantineProvider>
  );
}
