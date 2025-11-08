import { Outlet } from 'react-router-dom';

export default function ClassesSectionLayout() {
  // Layout wrapper for /dashboard/classes; enables index and nested routes consistently
  return <Outlet />;
}
