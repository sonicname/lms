import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../modules/auth/stores/auth-store';

export default function Homepage() {
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn()) {
    return <Navigate to='/auth/sign-in' replace />;
  }

  return <Navigate to='/dashboard' replace />;
}
