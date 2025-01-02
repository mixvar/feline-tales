import clsx from 'clsx';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { supabase } from '../lib/supabase';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const intl = useIntl();

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return intl.formatMessage({ id: 'login.validation.empty' });
    }
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return intl.formatMessage({ id: 'login.validation.invalid' });
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

  const getButtonText = () => {
    switch (status) {
      case 'loading':
        return intl.formatMessage({ id: 'login.button.sending' });
      case 'success':
        return intl.formatMessage({ id: 'login.button.sent' });
      default:
        return intl.formatMessage({ id: 'login.button.send' });
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'error':
        return intl.formatMessage({ id: 'login.status.error' });
      case 'success':
        return intl.formatMessage({ id: 'login.status.success' });
      case 'loading':
        return intl.formatMessage({ id: 'login.status.loading' });
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8 md:gap-12">
      <h1 className="text-3xl md:text-5xl font-cursive text-center text-felineGreen-dark drop-shadow-lg">
        <FormattedMessage id="login.title" />
      </h1>
      <div className="w-full max-w-md bg-white bg-opacity-50 rounded-lg shadow-lg p-8">
        <p className="text-gray-600 mb-6">
          <FormattedMessage id="login.description" />
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <FormattedMessage id="login.email.label" />
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="w-full px-4 py-2 border border-gray-300 bg-slate-100 bg-transparent-50 rounded-md focus:ring-2 focus:ring-felineGreen-dark focus:border-felineGreen-dark"
              placeholder={intl.formatMessage({ id: 'login.email.placeholder' })}
            />
            {validationError && <p className="text-red-600 text-sm mt-1">{validationError}</p>}
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full bg-felineGreen-dark text-white py-2 px-4 rounded-md hover:bg-felineGreen-darker focus:outline-none focus:ring-2 focus:ring-felineGreen-dark focus:ring-offset-2 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {getButtonText()}
          </button>

          {status !== 'idle' && (
            <p
              className={clsx('text-sm mt-2', {
                'text-red-600': status === 'error',
                'text-green-600': status === 'success',
              })}
            >
              {getStatusMessage()}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
