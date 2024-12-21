import { useAuth } from './hooks/useAuth';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

export const App = () => {
  const { session } = useAuth();

  if (!session) {
    return <LoginPage />;
  }

  return (
    <HomePage
      user={{
        id: session.user.id,
        email: session.user.email,
      }}
    />
  );
};
