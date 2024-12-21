import felineStoriesLogo from '../../assets/feline-stories.webp';
import { UserWidget } from '../components/UserWidget';
import { useCatsQuery } from '../hooks/useCatsQuery';
import { User } from '../types';

export const HomePage = ({ user }: { user: User }) => {
  const cats = useCatsQuery();

  return (
    <>
      <UserWidget user={user} />
      <div className="max-w-7xl mx-auto p-8 flex flex-col items-center justify-center gap-4">
        <img className="h-[400px]" src={felineStoriesLogo} alt="logo" />
        <h1 className="text-felineGreen-dark text-[6rem] font-cursive text-gradient-animation">
          Kocie Opowieści
        </h1>

        <pre className="w-full overflow-auto">{JSON.stringify({ user, cats }, null, 2)}</pre>
      </div>
    </>
  );
};
