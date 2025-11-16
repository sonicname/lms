import { Outlet } from 'react-router';
import withAuth from '~/modules/auth/HOC/with-auth';
import TopBar from '~/modules/school-schedule/components/top-bar';

function SchoolScheduleLayout() {
  return (
    <div className='flex flex-col w-full h-screen'>
      <TopBar />

      <div className='flex-1'>
        <Outlet />
      </div>
    </div>
  );
}

export default withAuth(SchoolScheduleLayout);
