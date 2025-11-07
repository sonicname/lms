import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router-dom';
import router from './core/routers/routes';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import ReactQueryProvider from './core/providers/react-query';
import './index.css';

export default function App() {
  return (
    <MantineProvider>
      <ReactQueryProvider>
        <RouterProvider router={router} />
      </ReactQueryProvider>
      <Notifications position='top-right' />
    </MantineProvider>
  );
}
