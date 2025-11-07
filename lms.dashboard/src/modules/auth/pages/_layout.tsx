import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className='auth-layout w-full min-h-screen flex items-center justify-center'>
      <Outlet />
    </div>
  );
}
