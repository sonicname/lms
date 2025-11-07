import { Outlet } from 'react-router-dom';
import MenuSidebar from '../components/menu-sidebar';

export default function DashboardLayout() {
  return (
    <div className='w-full h-screen overflow-hidden flex'>
      <MenuSidebar />

      <div className='flex-1'>
        <Outlet />
      </div>
    </div>
  );
}
