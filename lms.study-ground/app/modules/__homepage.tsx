import { Navigate } from 'react-router';
import { useAuthStore } from '~/modules/auth/stores/auth-store';

export default function Homepage() {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn()) {
    return <Navigate to='/auth/sign-in' />;
  }

  if (isLoggedIn()) {
    return <Navigate to='/school-schedule' />;
  }

  return (
    <div>
      <h1>Welcome to the Study Ground!</h1>
    </div>
  );
}
