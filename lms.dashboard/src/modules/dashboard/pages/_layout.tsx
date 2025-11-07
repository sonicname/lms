import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../auth/stores/auth-store';
import MenuSidebar from '../components/menu-sidebar';

export default function DashboardLayout() {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn()) {
    return <Navigate to='/auth/sign-in' replace />;
  }

  return (
    <div className='w-full h-screen overflow-hidden flex'>
      <MenuSidebar />

      <div className='flex-1'>
        <Outlet />
      </div>
    </div>
  );
}
