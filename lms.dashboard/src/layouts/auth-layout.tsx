import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className='w-full h-screen flex justify-center'>
      <Outlet />
    </div>
  );
}
