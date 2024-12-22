import clsx from 'clsx';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Pole email nie może być puste';
    }
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Podaj prawidłowy adres email';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setStatus('loading');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setStatus('success');
    } catch (error) {
      console.error('Error sending magic link:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8 md:gap-12">
      <h1 className="text-3xl md:text-5xl font-cursive text-center text-felineGreen-dark drop-shadow-lg">
        Poznaj Sekrety Kociej Krainy
      </h1>
      <div className="w-full max-w-md bg-white bg-opacity-50 rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">
          Aby uzyskać dostęp do aplikacji, po prostu podaj swój adres email poniżej.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Adres email
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="w-full px-4 py-2 border border-gray-300 bg-slate-100 bg-transparent-50 rounded-md focus:ring-2 focus:ring-felineGreen-dark focus:border-felineGreen-dark"
              placeholder="Wpisz swój email"
            />
            {validationError && <p className="text-red-600 text-sm mt-1">{validationError}</p>}
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-felineGreen-dark text-white py-2 px-4 rounded-md hover:bg-felineGreen-darker focus:outline-none focus:ring-2 focus:ring-felineGreen-dark focus:ring-offset-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading'
              ? 'Wysyłanie... '
              : status === 'success'
                ? 'Link wysłany! ✨'
                : 'Wyślij magiczny link ✨'}
          </button>

          {status !== 'idle' && (
            <p
              className={clsx('text-sm mt-2', {
                'text-red-600': status === 'error',
                'text-green-600': status === 'success',
              })}
            >
              {status === 'error' && 'Błąd podczas wysyłania magicznego linku. Spróbuj ponownie.'}
              {status === 'success' && 'Sprawdź swoją skrzynkę email!'}
              {status === 'loading' && 'Wysyłanie magicznego linku...'}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
