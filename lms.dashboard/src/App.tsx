import { Button, MantineProvider } from '@mantine/core';

export default function App() {
  return (
    <MantineProvider>
      <div className='text-2xl'>
        <Button>Hello, Tailwind CSS with Mantine!</Button>
      </div>
    </MantineProvider>
  );
}
