import md5 from 'md5';
import { useCallback, useRef, useState } from 'react';

import { useClickOutside } from '../hooks/useClickOutside';
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const UserWidget = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(() => {
    setIsOpen(false);
  }, []);

  useClickOutside(dropdownRef, handleClickOutside);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const gravatarUrl = user.email
    ? `https://www.gravatar.com/avatar/${md5(user.email.toLowerCase().trim())}?d=identicon`
    : 'https://www.gravatar.com/avatar/?d=mp';

  return (
    <div className="fixed top-4 right-4 z-10" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-felineGreen-dark hover:border-felineGreen-light transition-colors"
      >
        <img src={gravatarUrl} alt="User avatar" className="w-full h-full object-cover" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 truncate">
            {user.email}
          </div>
          <button
            onClick={() => void handleSignOut()}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Wyloguj
          </button>
        </div>
      )}
    </div>
  );
};
