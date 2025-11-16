import type { JSX } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '~/modules/auth/stores/auth-store';

export default function withAuth<T extends JSX.IntrinsicAttributes>(
  WrappedComponent: React.ComponentType<T>,
) {
  return function AuthenticatedComponent(props: T) {
    const { isLoggedIn } = useAuthStore();

    if (!isLoggedIn()) {
      return <Navigate to='/auth/sign-in' />;
    }

    return <WrappedComponent {...props} />;
  };
}
