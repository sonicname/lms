import { MantineProvider } from '@mantine/core';
import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <MantineProvider>
      <Outlet />
    </MantineProvider>
  );
}
