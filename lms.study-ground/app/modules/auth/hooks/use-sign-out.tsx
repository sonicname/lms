import { useTokenStore } from '~/core/api/token-manager';
import { useAuthStore } from '~/modules/auth/stores/auth-store';

export default function useSignOut() {
  const { clearAuth } = useAuthStore();
  const { clearTokens } = useTokenStore();

  function signOut() {
    clearAuth();
    clearTokens();
  }

  return { signOut };
}
