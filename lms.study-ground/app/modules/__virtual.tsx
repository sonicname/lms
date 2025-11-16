import { Outlet } from 'react-router';

// Placeholder layout used by route builder for directories without explicit layout
export default function VirtualLayout() {
  return <Outlet />;
}
