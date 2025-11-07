import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router-dom';
import router from './core/routers/routes';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

export default function App() {
  return (
    <MantineProvider>
      <RouterProvider router={router} />

      <Notifications position='top-right' />
    </MantineProvider>
  );
}
