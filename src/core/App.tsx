import { useAuth } from './hooks/useAuth';
import { useUserRole } from './hooks/useUserRole.ts';
import { AppRoutes } from './pages/AppRoutes.tsx';
import { LoginPage } from './pages/LoginPage';
import { AccessDenied } from './pages/AccessDenied.tsx';

export const App = () => {
  const { session } = useAuth();

  if (!session) {
    return <LoginPage />;
  }

  return (
    <RestrictedAccess>
      <AppRoutes
        user={{
          id: session.user.id,
          email: session.user.email,
        }}
      />
    </RestrictedAccess>
  );
};

const RestrictedAccess = ({ children }: { children: React.ReactNode }) => {
  const { data: userRole } = useUserRole();

  if (!userRole) {
    // TODO: loading/error handling could be improved
    return null;
  }

  if (userRole === 'none') {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
