import { Outlet } from 'react-router';
import withAuth from '~/modules/auth/HOC/with-auth';

export default withAuth(function ProfileLayout() {
  return <Outlet />;
});
