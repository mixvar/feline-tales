import { useAuth } from './hooks/useAuth';
import { useUserRole } from './hooks/useUserRole.ts';
import { AppRoutes } from './pages/AppRoutes.tsx';
import { LoginPage } from './pages/LoginPage';
import { AccessDenied } from './pages/AccessDenied.tsx';
import { Spinner } from './components/base/Spinner.tsx';

export const App = () => {
  const auth = useAuth();

  if (auth.isLoading && !auth.session) {
    return <Spinner />;
  }

  if (!auth.session) {
    return <LoginPage />;
  }

  return (
    <RestrictedAccess>
      <AppRoutes
        user={{
          id: auth.session.user.id,
          email: auth.session.user.email,
        }}
      />
    </RestrictedAccess>
  );
};

const RestrictedAccess = ({ children }: { children: React.ReactNode }) => {
  const { data: userRole } = useUserRole();

  if (!userRole) {
    return <Spinner />;
  }

  if (userRole === 'none') {
    return <AccessDenied />;
  }

  return <>{children}</>;
};
