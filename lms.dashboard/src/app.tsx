import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { RouterProvider } from 'react-router-dom';
import ReactQueryProvider from './core/providers/react-query';
import router from './core/routers/routes';

import '@mantine/core/styles.css';

import '@mantine/carousel/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
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
