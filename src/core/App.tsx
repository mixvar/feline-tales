import { useAuth } from './hooks/useAuth';
import { AppRoutes } from './pages/AppRoutes.tsx';
import { LoginPage } from './pages/LoginPage';

export const App = () => {
  const { session } = useAuth();

  if (!session) {
    return <LoginPage />;
  }

  return (
    <AppRoutes
      user={{
        id: session.user.id,
        email: session.user.email,
      }}
    />
  );
};
